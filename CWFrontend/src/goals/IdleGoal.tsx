import { MapService } from '_services/index';
import { Vector3 } from 'three';
import { IDwarf } from '_entities/dwarfs/index';
import { CompositeGoal, TurnGoal, WalkGoal } from '_goals/index';

export class IdleGoal extends CompositeGoal {
  target: Vector3;

  constructor(dwarf: IDwarf) {
    super(dwarf, 'Idle');
    this.target = this.dwarf.position;
  }

  FindNewPointOfInteres() {
    let direction = Math.floor(Math.random() * 1) > 0 ? 1 : -1;
    let max = Math.floor(Math.random() * 10) + 1;

    for(let x: number = max; x > 0; x--) {
      let newPoint = this.target.clone();
      newPoint.x = Math.floor(this.target.x) + Math.floor(x) * direction;
      if (MapService.Instance.CanBeReached(newPoint)) {
        this.target = newPoint;
        break;
      }
      newPoint.x = Math.floor(this.target.x) + Math.floor(x) * (direction * direction);
      if (MapService.Instance.CanBeReached(newPoint)) {
        this.target = newPoint;
        break;
      }
    }
  }

  Activate() {
    super.Activate();

    this.FindNewPointOfInteres();
    this.subGoals.Push(new TurnGoal(this.dwarf, 0));
    this.subGoals.Push(new WalkGoal(this.dwarf, this.target));
    this.subGoals.Push(new TurnGoal(this.dwarf, this.target.x > this.dwarf.position.x ? 90 : 270));
    this.completed = false;
  }
}