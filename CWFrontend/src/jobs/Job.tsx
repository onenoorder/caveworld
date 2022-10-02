import { ITask } from '_tasks/index';
import { Vector3 } from 'three';
import { IDwarf } from '_entities/dwarfs/index';
import { IJob } from '_jobs/index';
import { IStack, Stack } from '_utilities/index';
import { IGoal } from '_goals/index';

abstract class Job implements IJob {
  position: Vector3;
  height: number;
  width: number;
  dwarfs: IDwarf[];
  dwarfsLimit: number;
  name: string;
  state: number;
  tasks: IStack<ITask>;

  constructor(position: Vector3, height: number, width: number, name: string, state: number, dwarfsLimit: number) {
    this.position = position;
    this.height = height
    this.width = width;
    this.dwarfs = [];
    this.name = name;
    this.state = state;
    this.dwarfsLimit = dwarfsLimit;

    this.tasks = new Stack<ITask>();
  }
  
  Destroy(): void {
    while(this.tasks.Size() > 0) {
      this.tasks.Pop();
    }
  }

  IsFull(): boolean {
    return this.dwarfs.length >= this.dwarfsLimit;
  }

  AddDwarf(dwarf: IDwarf) {
    this.dwarfs.push(dwarf);
  }

  Tick(delta: number): void {}

  Work(dwarf: IDwarf): IGoal | null {
    var task: ITask | undefined = this.tasks.Pop();
    return task ? task.Work(dwarf) : null;
  }

  IsCompleted(): boolean {
    return this.tasks.Size() === 0;
  }
}

export { Job };