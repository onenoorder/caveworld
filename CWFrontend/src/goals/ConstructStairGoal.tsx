import { Vector3 } from 'three';
import { IDwarf } from '_entities/dwarfs/index';
import { Goal } from '_goals/index';
import { Stair } from '_entities/index';
import { EntityService, MapService } from '_services/index';

export class ConstructStairGoal extends Goal {
  target: Vector3;
  stair: Stair;

  constructor(dwarf: IDwarf, target: Vector3) {
    super(dwarf, 'Idle', 0);
    this.target = target;
    this.stair = new Stair(target);
  }

  GetName(): string {
    return 'Idle';
  }

  Activate(): void {
    super.Activate();
    if (!MapService.Instance.IsClimbable(this.target)) {
      EntityService.Instance.AddStair(this.stair);
    } else {
      this.completed = true;
    }
  }

  Run(delta: number): Vector3 {
    let returnValue = super.Run(delta);

    if (!this.completed) {
      this.stair.Build(delta);
      this.completed = this.stair.IsBuild();
    }

    return returnValue;
  }
}