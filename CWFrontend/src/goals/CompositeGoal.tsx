import { IStack, Stack } from '_utilities/index';
import { Goal, IGoal } from '_goals/index';
import { IDwarf } from '_entities/dwarfs/index';
import { Vector3 } from 'three';

export class CompositeGoal extends Goal {
	subGoals: IStack<IGoal>;

	constructor(dwarf: IDwarf, name: string) {
    super(dwarf, name, 0);
		this.subGoals = new Stack<IGoal>();
	}

	GetName(): string {
    return this.subGoals.Peek() ? (this.subGoals.Peek() as IGoal).GetName() : this.name;
  }

  GetState(): number {
    return this.subGoals.Peek() ? (this.subGoals.Peek() as IGoal).GetState() : this.state;
  }

	Run(delta: number): Vector3 {
		if (!this.active)
			this.Activate();

		let returnValue = new Vector3(0, 0, 0);

		if (this.subGoals.Size() > 0) {
			let goal = this.subGoals.Peek() as IGoal;
			returnValue.add(goal.Run(delta));
			if (goal.completed) {
				this.subGoals.Peek()?.Terminate();
				this.subGoals.Pop();
			}
		} else {
			this.completed = true;
		}

		return returnValue;
  }
}