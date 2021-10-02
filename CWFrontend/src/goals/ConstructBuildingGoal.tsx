import { MapService } from '_services/index';
import { Vector3 } from 'three';
import { IDwarf } from '_entities/dwarfs/index';
import { IBuilding } from '_entities/buildings/index';
import { CompositeGoal, FollowPathGoal } from '_goals/index';

export class ConstructBuildingGoal extends CompositeGoal {
  building: IBuilding;
  starting: boolean = true;
  lastBuild: number = 0;
  buildProgress: number = 0;
  target: Vector3;

  constructor(dwarf: IDwarf, building: IBuilding) {
    super(dwarf, 'Build');
    this.building = building;
    this.target = building.GetRightCorner();
  }

  Activate() {
    super.Activate();

    let from = this.dwarf.position.clone();
    from.x = Math.floor(from.x);
    from.y = Math.floor(from.y);
    from.z = 0;

    this.subGoals.Push(new FollowPathGoal(this.dwarf, MapService.Instance.paths.ShortestUnweightedPath(from, this.target)));
    this.completed = false;
  }

  Run(delta: number): Vector3 {
    let returnValue = super.Run(delta);

    if (this.completed && this.dwarf.position.x === this.target.x && this.dwarf.position.y === this.target.y) {
      this.lastBuild += delta;

      if (this.starting && this.lastBuild > 1) {
        this.lastBuild = 0;
        this.buildProgress += 1;
        this.building.Build(1);
      }

      this.completed = this.buildProgress === 10;
    } else if (this.completed) {
      this.Activate();
    }

    return returnValue;
  }
}