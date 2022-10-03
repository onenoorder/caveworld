import * as THREE from 'three';
import { Vector3 } from 'three';
import { IEntity } from 'entities';
import { TextureService, EntityService, SpawnService, MapService, PlacementService, JobService } from '_services/index';
import UserInput from './UserInput';
import { MainHouse } from '_houses/index';

class World {
  container: any;
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  clock: THREE.Clock;
  userInput: UserInput;
  spawnService: SpawnService;
  selectedEntity: IEntity | null;

  constructor(container: any) {
    this.container = container;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(100, this.container.offsetWidth / this.container.offsetHeight, 1, 10000);

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);

    TextureService.Setup();
    JobService.Setup();
    MapService.Setup(this.scene, this.renderer, 135, 240);

    EntityService.Setup(this.scene);
    PlacementService.Setup(this.scene);
    this.userInput = new UserInput(this.container, this.camera, this.renderer);

    this.container.append(this.renderer.domElement);

    this.clock = new THREE.Clock();

    let mainHouse = new MainHouse(new Vector3(Math.floor(MapService.Instance.width / 2) - 3, Math.floor(MapService.Instance.height / 2) - 3, 0));
    MapService.Instance.Free(mainHouse.position.clone().add(new Vector3(-3)), mainHouse.height, mainHouse.width + 6);
    MapService.Instance.Free(mainHouse.position.clone().add(new Vector3(6)), 1, 3);
    MapService.Instance.Free(mainHouse.position.clone().add(new Vector3(9)), 2, 8);

    this.selectedEntity = mainHouse;
    EntityService.Instance.TryAddBuilding(mainHouse);

    this.spawnService = new SpawnService(mainHouse.GetDoorPosition());

    this.camera.position.x = mainHouse.position.x + 3;
    this.camera.position.y = mainHouse.position.y + 3;
    this.camera.position.z = 10;
  }

  destroy() {
    this.clock.stop();

    TextureService.Instance.Destroy();
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

    EntityService.Instance.Tick(delta);
    this.spawnService.Tick(delta);

    this.camera.position.x += this.userInput.movement.x * this.userInput.cameraSpeedAtZoomLevel * delta;
    this.camera.position.y += this.userInput.movement.y * this.userInput.cameraSpeedAtZoomLevel * delta;
    this.camera.position.z += this.userInput.movement.z;
    this.userInput.movement.z = 0;
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