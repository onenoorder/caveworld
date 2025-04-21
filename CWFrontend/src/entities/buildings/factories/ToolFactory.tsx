import { Vector3 } from 'three';
import { Factory } from './Factory';

class ToolFactory extends Factory {
  constructor(position: Vector3) {
    super('ToolFactory', position, 3, 5, 1, 16);
  }
}

export { ToolFactory };