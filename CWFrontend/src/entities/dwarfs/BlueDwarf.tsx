import { Vector3 } from 'three';
import { IHouse } from 'entities/buildings/houses';
import { Dwarf } from '.';

class BlueDwarf extends Dwarf {
	constructor(position: Vector3, home: IHouse | null) {
    super(position, home, 'blue');
  }
}

export { BlueDwarf };