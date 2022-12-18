import { Vector3 } from 'three';
import { CraftJob } from '_jobs/index';
import { CraftStairTask } from '_tasks/index';

class CraftStairJob extends CraftJob {
  constructor(startPosition: Vector3, endPosition: Vector3) {
    super(0, 0, 'CraftStair', 0, 1, startPosition, endPosition);

    let direction = startPosition.y > endPosition.y ? +1 : -1;
    for(let y = endPosition.y; y !== startPosition.y; y += direction) {
      let digSite = startPosition.clone();
      digSite.y = y;
      let digStartPosition = digSite.clone().add(new Vector3(0, direction));
      this.tasks.Push(new CraftStairTask(digSite, digStartPosition));
    }
  }
}

export { CraftStairJob };