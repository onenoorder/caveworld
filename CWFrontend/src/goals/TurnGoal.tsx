import { Vector3 } from 'three';
import { IDwarf } from '_entities/dwarfs/index';
import { Goal } from '_goals/index';

export class TurnGoal extends Goal {
  degrees: number;
  lastAction: number = 0;
  direction: number = 0;

  constructor(dwarf: IDwarf, degrees: number) {
    super(dwarf, 'Turn', 0);
    this.degrees = degrees;
  }

  Activate() {
    super.Activate();

    let diff = this.dwarf.rotation - this.degrees;
    if (diff < 0)
      diff *= -1;

    if (this.degrees > this.dwarf.rotation) {
      this.direction = diff > 180 ? -1 : 1;
    } else {
      this.direction = diff < 180 ? -1 : 1;
    }

    this.UpdateState();
  }

  UpdateState() {
    this.state = this.dwarf.rotation;
    if (this.state > 0)
      this.state /= 30;
  }

  Run(delta: number): Vector3 {
    let returnValue = super.Run(delta);
    this.lastAction += delta;

    if (this.lastAction > 0.5) {
      this.dwarf.rotation += 30 * this.direction;
      if (this.dwarf.rotation < 0)
        this.dwarf.rotation += 360;
      if (this.dwarf.rotation >= 360)
        this.dwarf.rotation -= 360;
      
      this.UpdateState();
      this.lastAction = 0;

      if (this.dwarf.rotation === this.degrees) {
        this.completed = true;
        if (this.degrees === 270)
          this.dwarf.direction.x = -1;
        else if (this.degrees === 90)
          this.dwarf.direction.x = 1;
        else
          this.dwarf.direction.x = 0;
      }
    }

    return returnValue;
  }
}