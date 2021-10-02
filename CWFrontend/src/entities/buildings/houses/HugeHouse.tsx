import { Vector3 } from 'three';
import { House } from '.';

class HugeHouse extends House {
  constructor(position: Vector3) {
    super('HugeHouse', position, 4, 5, 1, 24);
  }
}

export { HugeHouse };