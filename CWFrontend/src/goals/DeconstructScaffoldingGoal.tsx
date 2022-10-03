import { Vector3 } from 'three';
import { MapService } from '_services/index';
import { IDwarf } from '_dwarfs/index';
import { IBuilding } from '_buildings/index';
import { CompositeGoal, FollowPathGoal, DeconstructScaffoldGoal } from '_goals/index';
import { Scaffold } from '_entities/Scaffold';
import { IQueue } from '_utilities/Queue';

export class DeconstructScaffoldingGoal extends CompositeGoal {
  building: IBuilding;
  starting: boolean = true;
  scaffolds: IQueue<Scaffold>;

  constructor(dwarf: IDwarf, building: IBuilding, scaffolds: IQueue<Scaffold>) {
    super(dwarf, 'Build');

    this.building = building;
    this.scaffolds = scaffolds;
  }

  Activate() {
    super.Activate();

    let from = this.dwarf.position.clone();
    from.x = Math.floor(from.x);
    from.y = Math.floor(from.y);
    from.z = 0;

    while (this.scaffolds.Size() > 0) {
      let scaffold = this.scaffolds.Dequeue();
      if (scaffold !== undefined)
        this.subGoals.Push(new DeconstructScaffoldGoal(this.dwarf, scaffold));
    }

    this.subGoals.Push(new FollowPathGoal(this.dwarf, MapService.Instance.paths.ShortestUnweightedPath(from, this.building.GetLeftCorner())));
    this.completed = false;
  }

  Run(delta: number): Vector3 {
    let returnValue = new Vector3();
    
    if (this.building.IsBuild()) {
      returnValue = super.Run(delta);
    }

    return returnValue;
  }
}