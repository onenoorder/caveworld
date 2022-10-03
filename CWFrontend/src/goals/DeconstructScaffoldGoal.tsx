import { Vector3 } from 'three';
import { IDwarf } from '_entities/dwarfs/index';
import { Goal } from '_goals/index';
import { Scaffold } from '_entities/index';
import { EntityService } from '_services/index';

export class DeconstructScaffoldGoal extends Goal {
  lastAction: number = 0;
  scaffold: Scaffold;

  constructor(dwarf: IDwarf, scaffold: Scaffold) {
    super(dwarf, 'Idle', 0);
    this.scaffold = scaffold;
  }

  GetName(): string {
    return 'Idle';
  }

  Run(delta: number): Vector3 {
    let returnValue = super.Run(delta);

    this.lastAction += delta;
    if (this.lastAction > 0.2) {
      this.state += Math.floor(this.lastAction / 0.1);
      if (this.state > 4) {
        EntityService.Instance.RemoveScaffold(this.scaffold);
        this.completed = true;
      }
    
      this.lastAction = 0;
    }

    return returnValue;
  }
}