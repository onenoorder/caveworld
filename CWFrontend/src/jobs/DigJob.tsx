import { Vector3 } from 'three';
import { CraftJob } from '_jobs/index';
import { DigTask } from '_tasks/index';

class DigJob extends CraftJob {
  constructor(startPosition: Vector3, endPosition: Vector3) {
    super(0, 0, 'Dig', 0, 1, startPosition, endPosition);

    let direction = startPosition.x > endPosition.x ? +1 : -1;
    for(let x = endPosition.x; x !== startPosition.x; x += direction) {
      let digSite = startPosition.clone();
      digSite.x = x;
      let digStartPosition = digSite.clone().add(new Vector3(direction));
      this.tasks.Push(new DigTask(digSite, digStartPosition));
    }
  }
}

export { DigJob };