import { Vector3 } from 'three';
import { IDwarf } from '_entities/dwarfs/index';
import { Goal } from '_goals/index';

export class ClimbGoal extends Goal {
  target: Vector3;
  lastAction: number = 0;
  direction: number;

  constructor(dwarf: IDwarf, target: Vector3) {
    super(dwarf, 'Climb', 0);
    this.target = target;
    this.direction = 0;
  }

  Activate() {
    super.Activate();
    this.direction = this.dwarf.position.y > this.target.y ? -1 : 1;
    this.dwarf.direction.x = 0;
    this.dwarf.direction.y = this.direction;
    this.state = 1;
  }

  Run(delta: number): Vector3 {
    let returnValue = super.Run(delta);

    this.lastAction += delta;
    if (this.lastAction > 0.5) {
      this.state = Math.floor(this.lastAction / 0.5) * this.direction;
      if (this.state > 3) {
        this.state = 0;
      } else if (this.state < 0) {
        this.state = 3;
      }
    
      this.lastAction = 0;
      this.dwarf.position.y += this.direction * this.dwarf.maxSpeed.y;
    }

    if ((this.dwarf.direction.y > 0 && this.dwarf.position.y >= this.target.y) ||
      (this.dwarf.direction.y < 0 && this.dwarf.position.y <= this.target.y)) {
      this.completed = true;
      this.dwarf.velocity = new Vector3(0, 0, 0);
      this.dwarf.position = this.target.clone();
      returnValue = new Vector3(0, 0, 0);
    }

    return returnValue;
  }
}