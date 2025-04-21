import { Vector3 } from 'three';
import { Factory } from './Factory';

class CogwheelFactory extends Factory {
  constructor(position: Vector3) {
    super('CogwheelFactory', position, 3, 5, 1, 16);
  }
}

export { CogwheelFactory };