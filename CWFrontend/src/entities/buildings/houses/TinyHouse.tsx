import { Vector3 } from 'three';
import { House } from '.';

class TinyHouse extends House {
  constructor(position: Vector3) {
    super('TinyHouse', position, 2, 2, 1, 4);
  }
}

export { TinyHouse };