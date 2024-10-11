import { PerspectiveCamera, Vector3 } from 'three';
import { PlacementService } from '_services/index';

class Mouse {
    container: any;
    camera: PerspectiveCamera;
    movement: Vector3;
    moveMovement: Vector3;
    selectedCell: Vector3;
    cameraSpeed: number = 3;
    cameraSpeedAtZoomLevel: number = 1;
    cameraZoomSpeed: number = 1;
    cameraMinZoom: number = 4;

    borderScrollingTimeoutLatency: number = 750;
    borderScrollingTimeout: NodeJS.Timeout | null = null;

    clientX: number = 0;
    clientY: number = 0;

    constructor(container: any, camera: PerspectiveCamera, movement: Vector3, selectedCell: Vector3) {
        this.container = container;
        this.camera = camera;
        this.movement = movement;
        this.selectedCell = selectedCell;

        this.moveMovement = new Vector3();

        this.container.addEventListener('mousemove', this.MouseMove.bind(this), false);
        this.container.addEventListener('mouseleave', this.MouseLeave.bind(this), false);
        this.container.addEventListener('wheel', this.Scroll.bind(this), false);
        this.container.addEventListener('click', this.Click.bind(this), false);
    }

    Destroy() {
        this.container.removeEventListener('mousemove', this.MouseMove.bind(this), false);
        this.container.removeEventListener('mouseleave', this.MouseLeave.bind(this), false);
        this.container.removeEventListener('wheel', this.Scroll.bind(this), false);
        this.container.removeEventListener('click', this.Click.bind(this), false);
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
        this.clientX = e.clientX;
        this.clientY = e.clientY;
        this.CalculatedSelectedCell(e);

        let mag = 100;
        if (this.clientX > this.container.offsetWidth - mag)
            this.moveMovement.x = this.cameraSpeed;
        else if (this.clientX < mag)
            this.moveMovement.x = -this.cameraSpeed;
        else {
            this.moveMovement.x = 0;
            this.movement.x = 0;
        }

        if (this.clientY > this.container.offsetHeight - mag)
            this.moveMovement.y = -this.cameraSpeed;
        else if (this.clientY < mag)
            this.moveMovement.y = this.cameraSpeed;
        else {
            this.moveMovement.y = 0;
            this.movement.y = 0;
        }

        if (this.borderScrollingTimeout == null)
            this.borderScrollingTimeout = setTimeout(this.RunMoveMovement.bind(this), this.borderScrollingTimeoutLatency);
    }

    RunMoveMovement() {
        this.movement.x = this.moveMovement.x;
        this.movement.y = this.moveMovement.y;

        if (this.borderScrollingTimeout) {
            clearTimeout(this.borderScrollingTimeout);
            this.borderScrollingTimeout = null;
        }
    }

    MouseLeave(e: any) {
        this.movement.x = 0;
        this.movement.y = 0;
        this.movement.z = 0;

        this.moveMovement.x = 0;
        this.moveMovement.y = 0;
        this.moveMovement.z = 0;
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
}

export { Mouse };