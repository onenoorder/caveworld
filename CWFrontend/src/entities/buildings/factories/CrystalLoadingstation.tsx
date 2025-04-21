import { Vector3 } from 'three';
import { Factory } from './Factory';

class CrystalLoadingstation extends Factory {
  constructor(position: Vector3) {
    super('CrystalLoadingstation', position, 3, 4, 1, 16);
  }
}

export { CrystalLoadingstation };