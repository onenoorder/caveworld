import { ITask } from '_tasks/index';
import { IDwarf } from '_entities/dwarfs/index';
import { IGoal } from '_goals/index';

export abstract class Task implements ITask {
  goal: IGoal | null = null;

  IsCompleted(): boolean {
    return this.goal ? this.goal.completed : false;
  }

  IsActivate(): boolean {
    return this.goal ? this.goal.active : false;
  }

  abstract CreateGoal(dwarf: IDwarf): IGoal;

  Work(dwarf: IDwarf): IGoal {
    this.goal = this.CreateGoal(dwarf);
    return this.goal;
  }

  Destroy(): void {
    
  }
}