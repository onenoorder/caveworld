import { Vector3 } from 'three';
import { Factory } from './Factory';

class Steelworks extends Factory {
  constructor(position: Vector3) {
    super('Steelworks', position, 3, 5, 1, 16);
  }
}

export { Steelworks };