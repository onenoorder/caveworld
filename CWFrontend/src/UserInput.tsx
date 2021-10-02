import { PerspectiveCamera, Vector3 } from 'three';
import { PlacementService } from '_services/index';

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
  moveUp: boolean = false;
  moveRight: boolean = false;
  moveDown: boolean = false;
  moveLeft: boolean = false;

  constructor(container: any, camera: PerspectiveCamera, renderer: THREE.WebGLRenderer) {
    this.container = container;
    this.camera = camera;
    this.renderer = renderer;
    this.movement = new Vector3(0, 0, 0);
    this.selectedCell = new Vector3(0, 0, 0);

    this.container.addEventListener('mousemove', this.MouseMove.bind(this), false);
    this.container.addEventListener('mouseleave', this.MouseLeave.bind(this), false);
    this.container.addEventListener('wheel', this.Scroll.bind(this), false);
    this.container.addEventListener('click', this.Click.bind(this), false);
    window.addEventListener('resize', this.WindowResize.bind(this), false);
    window.addEventListener('keydown', this.KeyDown.bind(this), false);
    window.addEventListener('keyup', this.KeyUp.bind(this), false);
  }

  Destroy() {
    this.container.removeEventListener('mousemove', this.MouseMove.bind(this), false);
    this.container.removeEventListener('mouseleave', this.MouseLeave.bind(this), false);
    this.container.removeEventListener('wheel', this.Scroll.bind(this), false);
    this.container.removeEventListener('click', this.Click.bind(this), false);
    window.removeEventListener('resize', this.WindowResize.bind(this), false);
    window.removeEventListener('keydown', this.KeyDown.bind(this), false);
    window.removeEventListener('keyup', this.KeyUp.bind(this), false);
  }

  CalculatedSelectedCell(e: any) {
    var vec = new Vector3();
    var pos = new Vector3();

    vec.set(
      (e.clientX / this.container.offsetWidth) * 2 - 1,
      - (e.clientY / this.container.offsetHeight) * 2 + 1,
      0.5);

    vec.unproject(this.camera);
    vec.sub(this.camera.position).normalize();
    var distance = -this.camera.position.z / vec.z;

    pos.copy(this.camera.position).add(vec.multiplyScalar(distance));

    this.selectedCell.x = Math.floor(pos.x);
    this.selectedCell.y = Math.floor(pos.y);
  }

  MouseMove(e: any) {
    this.CalculatedSelectedCell(e);

    let mag = 100;
    if (e.clientX > this.container.offsetWidth - mag)
      this.movement.x = this.cameraSpeed;
    else if (e.clientX < mag)
      this.movement.x = -this.cameraSpeed;
    else
      this.movement.x = 0;

    if (e.clientY > this.container.offsetHeight - mag)
      this.movement.y = -this.cameraSpeed;
    else if (e.clientY < mag)
      this.movement.y = this.cameraSpeed;
    else
      this.movement.y = 0;
  }

  MouseLeave(e: any) {
    this.movement = new Vector3(0, 0, 0);
  }

  Scroll(e: any) {
    if (e.wheelDelta >= 0)
      this.movement.z = -this.cameraZoomSpeed;
    else
      this.movement.z = this.cameraZoomSpeed;

    this.cameraSpeedAtZoomLevel = (this.camera.position.z + this.movement.z) / 4;
    if (this.cameraSpeedAtZoomLevel < 1)
      this.cameraSpeedAtZoomLevel = 1;
    if (this.cameraSpeedAtZoomLevel > 12)
      this.cameraSpeedAtZoomLevel = 12;

    if (this.camera.position.z + this.movement.z < this.cameraMinZoom)
      this.movement.z = this.cameraMinZoom - this.camera.position.z;
  }

  Click(e: any) {
    PlacementService.Instance.TryPlace(this.selectedCell);
  }

  WindowResize() {
    this.camera.aspect = this.container.offsetWidth / this.container.offsetHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
  }

  CalculateMovement() {
    this.movement.x = 0;
    this.movement.y = 0;

    if (this.moveUp)
      this.movement.y = this.cameraSpeed;
    if (this.moveRight)
      this.movement.x = this.cameraSpeed;
    if (this.moveDown)
      this.movement.y = -this.cameraSpeed;
    if (this.moveLeft)
      this.movement.x = -this.cameraSpeed;
  }

  KeyDown(e: any) {
    if (e.which === 68 || e.which === 39) // D
      this.moveRight = true;
    else if (e.which === 83 || e.which === 40) // S
      this.moveDown = true;
    else if (e.which === 65 || e.which === 37) // A
      this.moveLeft = true;
    else if (e.which === 87 || e.which === 38) // W
      this.moveUp = true;

    this.CalculateMovement();
  }

  KeyUp(e: any) {
    if (e.which === 68 || e.which === 39) // D
      this.moveRight = false;
    else if (e.which === 83 || e.which === 40) // S
      this.moveDown = false;
    else if (e.which === 65 || e.which === 37) // A
      this.moveLeft = false;
    else if (e.which === 87 || e.which === 38) // W
      this.moveUp = false;

    this.CalculateMovement();
  }
}

export default UserInput;