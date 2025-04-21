import { Vector3 } from 'three';
import { Factory } from './Factory';

class Stoneworks extends Factory {
  constructor(position: Vector3) {
    super('Stoneworks', position, 3, 5, 1, 16);
  }
}

export { Stoneworks };