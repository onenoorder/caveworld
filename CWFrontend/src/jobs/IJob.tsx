import { IGoal } from '_goals/index';
import { Vector3 } from 'three';
import { IDwarf } from '_entities/dwarfs';

export interface IJob {
  position: Vector3;
  height: number;
  width: number;
  dwarfs: IDwarf[];
  name: string;
  state: number;

  IsFull(): boolean;
  AddDwarf(dwarf: IDwarf): void;
  Tick(delta: number): void;
  Work(dwarf: IDwarf): IGoal | null;
  IsCompleted(): boolean;
}