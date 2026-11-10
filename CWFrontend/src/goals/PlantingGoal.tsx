import { MapService } from '_services/index';
import { Vector3 } from 'three';
import { IDwarf } from '_entities/dwarfs/index';
import { IPlant } from '_buildings/index';
import { CompositeGoal, FollowPathGoal } from '_goals/index';

// CAV-004: walk to the plant cell; arrival completes the planting (D3/D8).
// Mirrors ConstructBuildingGoal's drained-but-not-arrived re-path, minus
// any standing-work counter — the walk is the whole job.
export class PlantingGoal extends CompositeGoal {
  plant: IPlant;
  target: Vector3;

  constructor(dwarf: IDwarf, plant: IPlant) {
    super(dwarf, 'Plant');
    this.plant = plant;
    this.target = plant.GetRightCorner();
  }

  Activate() {
    super.Activate();

    let from = this.dwarf.position.clone();
    from.x = Math.floor(from.x);
    from.y = Math.floor(from.y);
    from.z = 0;

    this.subGoals.Push(new FollowPathGoal(
      this.dwarf,
      MapService.Instance.paths.ShortestUnweightedPath(from, this.target)));
    this.completed = false;
  }

  Run(delta: number): Vector3 {
    let returnValue = super.Run(delta);

    if (this.completed && this.dwarf.position.x === this.target.x && this.dwarf.position.y === this.target.y) {
      this.plant.Plant();
    } else if (this.completed) {
      this.Activate();
    }

    return returnValue;
  }
}
