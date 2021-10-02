import { GraphNode } from '_utilities/index';
import { IDwarf } from '_entities/dwarfs/index';
import { CompositeGoal, TurnGoal, WalkGoal } from '_goals/index';

export class FollowPathGoal extends CompositeGoal {
  path: GraphNode[];
  lastAction: number = 0;

  constructor(dwarf: IDwarf, path: GraphNode[]) {
    super(dwarf, 'FollowPath');
    this.path = path;
  }

  Activate() {
    super.Activate();

    if (this.path.length > 0 && this.path[this.path.length - 1].EqualsPosition(this.dwarf.position)) {
      this.completed = true;
    } else {
      for (let index = this.path.length - 1; index >= 1; index--) {
        let current = this.path[index];

        if (index === this.path.length - 1)
          this.subGoals.Push(new TurnGoal(this.dwarf, 0));

        this.subGoals.Push(new WalkGoal(this.dwarf, current.position.clone()));

        if (index > 0)
          this.subGoals.Push(new TurnGoal(this.dwarf, this.path[index - 1].position.x < current.position.x ? 90 : 270));
        else
          this.subGoals.Push(new TurnGoal(this.dwarf, current.position.x < this.dwarf.position.x ? 90 : 270));
      }

      if (this.path.length === 1) {
        this.subGoals.Push(new TurnGoal(this.dwarf, 0));
        this.subGoals.Push(new WalkGoal(this.dwarf, this.path[0].position.clone()));
        this.subGoals.Push(new TurnGoal(this.dwarf, this.path[0].position.x < this.dwarf.position.x ? 90 : 270));
      }

      this.completed = false;
    }
  }
}