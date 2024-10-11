import { Vector3 } from 'three';

class KeyBoard {
    moveUp: boolean = false;
    moveRight: boolean = false;
    moveDown: boolean = false;
    moveLeft: boolean = false;
    movement: Vector3;
    cameraSpeed: number;

    constructor(movement: Vector3, cameraSpeed: number) {
        this.movement = movement;
        this.cameraSpeed = cameraSpeed;
    
        window.addEventListener('keydown', this.KeyDown.bind(this), false);
        window.addEventListener('keyup', this.KeyUp.bind(this), false);
    }

    Destroy() {
        window.removeEventListener('keydown', this.KeyDown.bind(this), false);
        window.removeEventListener('keyup', this.KeyUp.bind(this), false);
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

export { KeyBoard };