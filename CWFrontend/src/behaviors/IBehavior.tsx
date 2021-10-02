import { Vector3 } from 'three';
import { IDwarf } from '_entities/dwarfs/index';

export interface IBehavior {
  dwarf: IDwarf | null;

  Execute(target: Vector3): Vector3;
}