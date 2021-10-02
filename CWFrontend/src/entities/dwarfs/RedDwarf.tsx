import { Vector3 } from 'three';
import { IHouse } from 'entities/buildings/houses';
import { Dwarf } from '.';

class RedDwarf extends Dwarf {
	constructor(position: Vector3, home: IHouse | null) {
    super(position, home, 'red');
  }
}

export { RedDwarf };