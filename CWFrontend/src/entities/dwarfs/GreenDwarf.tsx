import { Vector3 } from 'three';
import { IHouse } from '_buildings/houses';
import { Dwarf } from '_dwarfs/index';
import { DwarfKind } from '_utilities/Enums';

class GreenDwarf extends Dwarf {
	constructor(position: Vector3, home: IHouse | null) {
    super(position, home, DwarfKind.GREEN);
  }
}

export { GreenDwarf };