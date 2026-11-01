import * as THREE from 'three';
import { Vector3 } from 'three';
import { TextureService, JobService, MapService, InteractiontService, EntityService, PlacementService, ScaffoldService } from '_services/index';
import { MainHouse } from '_houses/index';

// WebGL/texture bootstrap shell for the World simulation.
// Excluded from the 100% coverage gate per the test-strategy allow-list:
// it constructs the Three.js renderer/camera and lets TextureService/MapService
// composite the cave/atlas textures. jsdom has no WebGL, and asserting on the
// engine verifies the engine rather than our code (see Quality & Test Strategy,
// "Exclusions": TextureService, Cave, Map — this wrapper belongs to that family).
class WorldRuntime {
  renderer: THREE.WebGLRenderer;
  camera: THREE.PerspectiveCamera;
  scene: THREE.Scene;
  mainHouse: MainHouse;

  constructor(container: any) {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(100, container.offsetWidth / container.offsetHeight, 1, 10000);

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(container.offsetWidth, container.offsetHeight);

    TextureService.Setup();
    JobService.Setup();
    MapService.Setup(this.scene, this.renderer, 135, 240);

    InteractiontService.Setup(this.scene);
    EntityService.Setup(this.scene);
    PlacementService.Setup(this.scene);
    ScaffoldService.Setup(this.scene);

    container.append(this.renderer.domElement);
    this.renderer.domElement.addEventListener("webglcontextlost", function (event) {
      console.log('lost');
      event.preventDefault();
    }, false);

    this.mainHouse = new MainHouse(new Vector3(Math.floor(MapService.Instance.width / 2) - 3, Math.floor(MapService.Instance.height / 2) - 3, 0));
    MapService.Instance.Free(this.mainHouse.position.clone().add(new Vector3(-12)), 4, 9);
    MapService.Instance.Free(this.mainHouse.position.clone().add(new Vector3(-3)), this.mainHouse.height, this.mainHouse.width + 6);
    MapService.Instance.Free(this.mainHouse.position.clone().add(new Vector3(6)), 1, 3);
    MapService.Instance.Free(this.mainHouse.position.clone().add(new Vector3(9)), 2, 8);

    // Register + render the main house so it is part of the entity registries
    // (buildings/houses) and the hover lookup, as on master.
    EntityService.Instance.TryAddBuilding(this.mainHouse);
  }
}

export default WorldRuntime;
