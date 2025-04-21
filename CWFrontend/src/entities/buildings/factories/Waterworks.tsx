import { Vector3 } from 'three';
import { Factory } from './Factory';

class Waterworks extends Factory {
  constructor(position: Vector3) {
    super('Waterworks', position, 4, 5, 1, 16);
  }
}

export { Waterworks };