import { SeekBehavior } from '_behaviors/index';
import { Vector3 } from 'three';
import { IDwarf } from '_entities/dwarfs/index';
import { Goal } from '_goals/index';

export class WalkGoal extends Goal {
  target: Vector3;
  seekBehavior: SeekBehavior;
  lastAction: number = 0;

  constructor(dwarf: IDwarf, target: Vector3) {
    super(dwarf, 'Walk', 0);
    this.target = target;

    this.seekBehavior = new SeekBehavior(this.dwarf);
  }

  GetName(): string {
    return this.dwarf.position.x > this.target.x ? 'WalkLeft' : 'WalkRight';
  }

  Run(delta: number): Vector3 {
    super.Run(delta);

    this.lastAction += delta;
    if (this.lastAction > 0.1) {
      this.state += Math.floor(this.lastAction / 0.1);
      if (this.state > 11)
        this.state -= 12;
    
      this.lastAction = 0;
    }

    let returnValue = this.seekBehavior.Execute(this.target.clone());

    if ((this.dwarf.direction.x > 0 && this.dwarf.position.x >= this.target.x) ||
      (this.dwarf.direction.x < 0 && this.dwarf.position.x <= this.target.x)) {
      this.completed = true;
      this.dwarf.velocity = new Vector3(0, 0, 0);
      this.dwarf.position = this.target.clone();
      returnValue = new Vector3(0, 0, 0);
    }

    returnValue.multiply(new Vector3(delta, delta, delta));

    return returnValue;
  }
}