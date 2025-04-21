import { Vector3 } from 'three';
import { Factory } from './Factory';

class FoodFactory extends Factory {
  constructor(position: Vector3) {
    super('FoodFactory', position, 3, 4, 1, 16);
  }
}

export { FoodFactory };