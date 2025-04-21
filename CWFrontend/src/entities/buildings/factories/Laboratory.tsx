import { Vector3 } from 'three';
import { Factory } from './Factory';

class Laboratory extends Factory {
  constructor(position: Vector3) {
    super('Laboratory', position, 3, 4, 1, 16);
  }
}

export { Laboratory };