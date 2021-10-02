import { Vector3 } from 'three';
import { IDwarf } from '_entities/dwarfs/index';

export interface IGoal {
  dwarf: IDwarf;
  completed: boolean;
  active: boolean;

  GetName(): string;
  GetState(): number;
  
  Run(delta: number): Vector3;
  Activate(): void;
  Terminate(): void;
}