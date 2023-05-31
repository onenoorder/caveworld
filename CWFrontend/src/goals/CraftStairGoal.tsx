import { MapService, EntityService } from '_services/index';
import { Vector3 } from 'three';
import { IDwarf } from '_entities/dwarfs/index';
import { CompositeGoal, FollowPathGoal, ConstructStairGoal, DigStairGoal } from '_goals/index';

export class CraftStairGoal extends CompositeGoal {
  target: Vector3;
  startPosition: Vector3;
  digProgress: number = 0;
  lastDig: number = 0;
  direction: number;
  starting: boolean = true;
  halfWayThere: boolean = false;

  constructor(dwarf: IDwarf, target: Vector3, startPosition: Vector3) {
    super(dwarf, 'Dig');
    this.target = target;
    this.startPosition = startPosition;
    this.direction = this.startPosition.y > this.target.y ? -1 : 1;
  }

  Activate() {
    super.Activate();

    let from = this.dwarf.position.clone();
    from.x = Math.floor(from.x);
    from.y = Math.floor(from.y);
    from.z = 0;

    this.subGoals.Push(new ConstructStairGoal(this.dwarf, this.target));
    this.subGoals.Push(new DigStairGoal(this.dwarf, this.target, this.startPosition));

    if (!EntityService.Instance.HasStair(this.startPosition)) {
      this.subGoals.Push(new ConstructStairGoal(this.dwarf, this.startPosition));
    }

    this.subGoals.Push(new FollowPathGoal(this.dwarf, MapService.Instance.paths.ShortestUnweightedPath(from, this.startPosition)));
    
    this.completed = false;
  }
}