import { Task } from '_tasks/index';
import { IDwarf } from '_entities/dwarfs/index';
import { Vector3 } from 'three';
import { CraftStairGoal, IGoal } from '_goals/index';

export class CraftStairTask extends Task {
  position: Vector3;
  startPosition: Vector3;

  constructor(position: Vector3, startPosition: Vector3) {
    super();
    this.position = position;
    this.startPosition = startPosition;
  }

  CreateGoal(dwarf: IDwarf): IGoal {
    return new CraftStairGoal(dwarf, this.position, this.startPosition);
  }
}