import { Vector3 } from 'three';
import { Factory } from './Factory';

class CharcoalBurner extends Factory {
  constructor(position: Vector3) {
    super('CharcoalBurner', position, 3, 4, 1, 16);
  }
}

export { CharcoalBurner };