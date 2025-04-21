import { Vector3 } from 'three';
import { Factory } from './Factory';

class Woodworks extends Factory {
  constructor(position: Vector3) {
    super('Woodworks', position, 3, 5, 1, 16);
  }
}

export { Woodworks };