import { Vector3 } from 'three';
import { IHouse } from '_buildings/houses';
import { Dwarf } from '.';
import { DwarfKind } from '_utilities/Enums';

class BlueDwarf extends Dwarf {
	constructor(position: Vector3, home: IHouse | null) {
    super(position, home, DwarfKind.BLUE);
  }
}

export { BlueDwarf };