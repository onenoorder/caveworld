import { Vector3 } from 'three';
import { MapService } from '_services/index';
import { IDwarf } from '_entities/dwarfs/index';
import { IBuilding } from '_entities/buildings/index';
import { CompositeGoal, FollowPathGoal, WalkGoal, ConstructScaffoldGoal } from '_goals/index';

export class ConstructScaffoldingGoal extends CompositeGoal {
  building: IBuilding;
  starting: boolean = true;

  constructor(dwarf: IDwarf, building: IBuilding) {
    super(dwarf, 'Build');
    this.building = building;
  }

  Activate() {
    super.Activate();

    let from = this.dwarf.position.clone();
    from.x = Math.floor(from.x);
    from.y = Math.floor(from.y);
    from.z = 0;

    for (let y = this.building.height - 1; y >= 0; y--) {
      for (let x = this.building.width - 1; x >= 0; x--) {
        let position: Vector3 = this.building.GetLeftCorner();
        position.add(new Vector3(x, y, 0));
        this.subGoals.Push(new ConstructScaffoldGoal(this.dwarf, position, this.calculateScaffoldNumber(x, y)));
        //this.subGoals.Push(new WalkGoal(this.dwarf, position));
      }
    }

    this.subGoals.Push(new FollowPathGoal(this.dwarf, MapService.Instance.paths.ShortestUnweightedPath(from, this.building.GetLeftCorner())));
    this.completed = false;
  }

  calculateScaffoldNumber(x: number, y: number) {
    let scaffoldNumber;

    if (y === 0) {
      scaffoldNumber = x % 2 == 0 ? 8 : 9;
    } else {
      scaffoldNumber = x % 2 == 0 ? 6 : 7;
    }

    return scaffoldNumber;
  }

  Run(delta: number): Vector3 {
    let returnValue = super.Run(delta);

    return returnValue;
  }
}