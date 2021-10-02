import { Vector3 } from 'three';
import { IBehavior } from '_behaviors/index';
import { IDwarf } from '_entities/dwarfs/index';

abstract class Behavior implements IBehavior {
  dwarf: IDwarf;

  constructor(dwarf: IDwarf) {
    this.dwarf = dwarf;
  }

  abstract Execute(target: Vector3): Vector3;
}

export { Behavior };