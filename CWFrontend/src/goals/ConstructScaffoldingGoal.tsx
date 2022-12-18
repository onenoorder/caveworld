import { Vector3 } from 'three';
import { MapService } from '_services/index';
import { IDwarf } from '_dwarfs/index';
import { IBuilding } from '_buildings/index';
import { CompositeGoal, FollowPathGoal, WalkGoal, ConstructScaffoldGoal } from '_goals/index';
import { IAddScaffold } from '_utilities/IAddScaffold';

export class ConstructScaffoldingGoal extends CompositeGoal {
  building: IBuilding;
  starting: boolean = true;
  addScaffold: IAddScaffold;

  constructor(dwarf: IDwarf, building: IBuilding, addScaffold: IAddScaffold) {
    super(dwarf, 'Idle');

    this.building = building;
    this.addScaffold = addScaffold;
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

        this.subGoals.Push(new ConstructScaffoldGoal(this.dwarf, position, this.CalculateScaffoldNumber(x, y), this.addScaffold));

        if (x === this.building.width - 1 && y !== this.building.height - 1) {
          this.subGoals.Push(new ConstructScaffoldGoal(this.dwarf, position, this.CalculateScaffoldStairNumber(x, y), this.addScaffold));
        }
        //this.subGoals.Push(new WalkGoal(this.dwarf, position));
      }
    }

    this.subGoals.Push(new FollowPathGoal(this.dwarf, MapService.Instance.paths.ShortestUnweightedPath(from, this.building.GetLeftCorner())));
    this.completed = false;
  }

  CalculateScaffoldNumber(x: number, y: number) {
    let scaffoldNumber;

    if (y % 2 === 0)
      scaffoldNumber = x % 2 === 0 ? 7 : 6;
    else
      scaffoldNumber = x % 2 === 0 ? 6 : 7;

    return scaffoldNumber;
  }

  CalculateScaffoldStairNumber(x: number, y: number) {
    return x % 2 === 0 ? 8 : 9;
  }

  Run(delta: number): Vector3 {
    let returnValue = super.Run(delta);

    return returnValue;
  }
}