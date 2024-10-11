import { PerspectiveCamera, Vector3 } from 'three';
import { KeyBoard } from './KeyBoard';
import { Browser } from './Browser';
import { Mouse } from './Mouse';

class UserInput {
  container: any;
  camera: PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  movement: Vector3;
  selectedCell: Vector3;
  cameraSpeed: number = 3;
  cameraSpeedAtZoomLevel: number = 1;
  cameraZoomSpeed: number = 1;
  cameraMinZoom: number = 4;

  keyBoard: KeyBoard;
  browser: Browser;
  mouse: Mouse;

  constructor(container: any, camera: PerspectiveCamera, renderer: THREE.WebGLRenderer) {
    this.container = container;
    this.camera = camera;
    this.renderer = renderer;
    this.movement = new Vector3(0, 0, 0);
    this.selectedCell = new Vector3(0, 0, 0);

    this.keyBoard = new KeyBoard(this.movement, this.cameraSpeed);
    this.browser = new Browser(this.container, this.camera, this.renderer);
    this.mouse = new Mouse(this.container, this.camera, this.movement, this.selectedCell);
  }

  Destroy() {
    this.keyBoard.Destroy();
    this.browser.Destroy();
    this.mouse.Destroy();
  }
}

export { UserInput };