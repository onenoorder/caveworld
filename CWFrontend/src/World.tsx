import * as THREE from 'three';
import { Vector3 } from 'three';
import { IEntity, Stair } from '_entities/index';
import WorldRuntime from './WorldRuntime';
import { TextureService, EntityService, SpawnService, MapService, PlacementService, InteractiontService } from '_services/index';
import { RedDwarf } from '_dwarfs/index';
import { UserInput } from '_controls/index';

// Quarry-blue (#3a6a8a) — "Selection highlight" per Style Guide.
const HIGHLIGHT_COLOR = 0x3a6a8a;

class World {
  container: any;
  runtime: WorldRuntime;
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  clock: THREE.Clock;
  userInput: UserInput;
  spawnService: SpawnService;
  selectedEntity: IEntity | null;
  selectedEntityOriginalColor: THREE.Color | null;

  constructor(container: any) {
    this.container = container;

    // WebGL/texture bootstrap (renderer, camera, scene, MapService/Cave atlas,
    // MainHouse) lives in the WorldRuntime shell, which is excluded from the
    // coverage gate per the test-strategy allow-list. Everything the simulation
    // needs afterwards stays reachable through the fields below.
    this.runtime = new WorldRuntime(container);

    this.renderer = this.runtime.renderer;
    this.scene = this.runtime.scene;
    this.camera = this.runtime.camera;

    this.clock = new THREE.Clock();

    this.selectedEntity = null;
    this.selectedEntityOriginalColor = null;

    this.userInput = new UserInput(this.container, this.camera, this.renderer);

    this.spawnService = new SpawnService(this.runtime.mainHouse.GetDoorPosition());

    this.camera.position.x = this.runtime.mainHouse.position.x + 3;
    this.camera.position.y = this.runtime.mainHouse.position.y + 3;
    this.camera.position.z = 10;

    // E2E/debug hook: exposes the live simulation and the app-bundle service
    // singletons so Cypress specs can assert mesh/material state (Three.js
    // draws into an opaque canvas, invisible to the DOM) without a second
    // module graph. Read-only from the tests' point of view, plus two seed
    // helpers for entities the early game cannot create from the toolbar yet.
    (window as any).__cw = {
      world: this,
      container: this.container,
      services: { EntityService, MapService, PlacementService },
      helpers: {
        // Projected screen (client) position of a grid cell centre, resolved
        // through the live camera — Cypress hovers with document coordinates.
        worldToScreen: (x: number, y: number) => {
          // Project needs up-to-date world/projection matrices; the render
          // loop refreshes them, but a caller between frames (e.g. a spec
          // right after seeding entities) must not see stale matrices.
          this.camera.updateMatrixWorld();
          this.camera.updateProjectionMatrix();
          const projected = new THREE.Vector3(x + 0.5, y + 0.5, 0).project(this.camera);
          const canvas = this.renderer.domElement;
          const rect = canvas.getBoundingClientRect();
          return {
            x: rect.left + ((projected.x + 1) / 2) * rect.width,
            y: rect.top + ((1 - projected.y) / 2) * rect.height,
          };
        },
        addDwarf: (x: number, y: number) => {
          const dwarf = new RedDwarf(new Vector3(x, y, 0), this.runtime.mainHouse);
          EntityService.Instance.AddDwarf(dwarf);
          return dwarf;
        },
        addStair: (x: number, y: number) => {
          const stair = new Stair(new Vector3(x, y, 0));
          EntityService.Instance.AddStair(stair);
          return stair;
        },
      },
    };
  }

  destroy() {
    this.clock.stop();

    TextureService.Instance.Destroy();
    InteractiontService.Instance.Destroy();
    MapService.Instance.Destroy();
    EntityService.Instance.Destroy();
    PlacementService.Instance.Destroy();
    this.userInput.Destroy();

    this.scene.clear();

    this.renderer.clear();
    this.renderer.dispose();
  }

  tick() {
    const delta = this.clock.getDelta();

    MapService.Instance.Tick(delta);
    PlacementService.Instance.SetPosition(this.userInput.selectedCell);

    this.updateHover();

    EntityService.Instance.Tick(delta);
    this.spawnService.Tick(delta);

    this.camera.position.x += this.userInput.movement.x * this.userInput.cameraSpeedAtZoomLevel * delta;
    this.camera.position.y += this.userInput.movement.y * this.userInput.cameraSpeedAtZoomLevel * delta;
    this.camera.position.z += this.userInput.movement.z;
    this.userInput.movement.z = 0;
  }

  updateHover() {
    if (!this.userInput.mouse.isMouseOver) {
      this.clearHover();
      return;
    }

    const entity = EntityService.Instance.GetEntityAtPosition(this.userInput.selectedCell);

    if (entity === this.selectedEntity)
      return;

    this.clearHover();

    if (entity) {
      this.selectedEntityOriginalColor = this.getMaterial(entity).color.clone();
      this.getMaterial(entity).color.setHex(HIGHLIGHT_COLOR);
      this.selectedEntity = entity;
    }
  }

  clearHover() {
    if (this.selectedEntity) {
      this.getMaterial(this.selectedEntity).color.copy(this.selectedEntityOriginalColor as THREE.Color);
      this.selectedEntityOriginalColor = null;
      this.selectedEntity = null;
    }
  }

  getMaterial(entity: IEntity): THREE.MeshBasicMaterial {
    return entity.object.material as THREE.MeshBasicMaterial;
  }

  render() {
    this.tick();
    this.renderer.render(this.scene, this.camera);
  }

  start() {
    this.renderer.setAnimationLoop(this.render.bind(this));
  }

  stop() {
    this.renderer.setAnimationLoop(null);
  }
}

export default World;
