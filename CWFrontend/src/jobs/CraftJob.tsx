import { Vector3 } from 'three';
import { Job } from '_jobs/index';

abstract class CraftJob extends Job {
  endPosition: Vector3;
  
  constructor(height: number, width: number, name: string, state: number, dwarfsLimit: number, startPosition: Vector3, endPosition: Vector3) {
    super(startPosition, height, width, name, state, dwarfsLimit);

    this.endPosition = endPosition;
  }
}

export { CraftJob };