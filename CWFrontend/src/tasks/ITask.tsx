import { IGoal } from '_goals/index';
import { IDwarf } from '_entities/dwarfs/index';

export interface ITask {
  Work(dwarf: IDwarf): IGoal;
  IsCompleted(): boolean;
  IsActivate(): boolean;
}