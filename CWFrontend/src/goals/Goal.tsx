import { Vector3 } from 'three';
import { IDwarf } from '_entities/dwarfs/index';
import { IGoal } from '_goals/index';

export abstract class Goal implements IGoal {
  dwarf: IDwarf;
  name: string;
  state: number;
  completed: boolean = false;
  active: boolean = false;

  constructor(dwarf: IDwarf, name: string, state: number) {
    this.dwarf = dwarf;
    this.name = name;
    this.state = state;
  }

  GetName(): string {
    return this.name;
  }

  GetState(): number {
    return this.state;
  }

  Run(delta: number): Vector3 {
    if (!this.active)
      this.Activate();
    
    return new Vector3(0, 0, 0);
  }

  Activate(): void {
    this.active = true;
  }

  Terminate(): void {
  }
}