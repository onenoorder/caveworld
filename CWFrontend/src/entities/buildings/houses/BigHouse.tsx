import { Vector3 } from 'three';
import { House } from '.';

class BigHouse extends House {
  constructor(position: Vector3) {
    super('BigHouse', position, 3, 4, 1, 16);
  }
}

export { BigHouse };