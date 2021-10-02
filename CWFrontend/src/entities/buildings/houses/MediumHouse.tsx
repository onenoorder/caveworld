import { Vector3 } from 'three';
import { House } from '.';

class MediumHouse extends House {
  constructor(position: Vector3) {
    super('MediumHouse', position, 3, 2, 1, 9);
  }
}

export { MediumHouse };