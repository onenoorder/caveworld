import { Vector3 } from 'three';
import { IDwarf } from '_entities/dwarfs/index';
import { Goal } from '_goals/index';
import { Scaffold } from '_entities/index';
import { EntityService } from '_services/index';
import { IAddScaffold } from '_utilities/IAddScaffold';

export class ConstructScaffoldGoal extends Goal {
  target: Vector3;
  lastAction: number = 0;
  currentScaffoldNumber: number = 0;
  scaffold: Scaffold;
  addScaffold: IAddScaffold;

  constructor(dwarf: IDwarf, target: Vector3, scaffoldNumber: number, addScaffold: IAddScaffold) {
    super(dwarf, 'Idle', 0);
    this.target = target;
    this.scaffold = new Scaffold(target, scaffoldNumber);
    this.addScaffold = addScaffold;
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
        this.currentScaffoldNumber++;

        if (this.currentScaffoldNumber === 1) {
          EntityService.Instance.AddScaffold(this.scaffold);
          this.addScaffold.AddScaffold(this.scaffold);
        } else {
          this.scaffold.Build(1);
          this.completed = this.scaffold.IsBuild();
        }
      }
    
      this.lastAction = 0;
    }

    return returnValue;
  }
}