import { Vector3 } from 'three';
import { IHouse } from 'entities/buildings/houses';
import { Dwarf } from '_dwarfs/index';

class GreenDwarf extends Dwarf {
	constructor(position: Vector3, home: IHouse | null) {
    super(position, home, 'green');
  }
}

export { GreenDwarf };