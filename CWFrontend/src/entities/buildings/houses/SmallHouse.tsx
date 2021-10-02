import { Vector3 } from 'three';
import { House } from '.';

class SmallHouse extends House {
  constructor(position: Vector3) {
    super('SmallHouse', position, 3, 3, 1, 6);
  }
}

export { SmallHouse };