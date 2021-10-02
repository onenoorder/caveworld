import { IJob, DigJob, CraftStairJob } from '_jobs/index';
import { Vector3 } from 'three';

class JobFactory {
  public static Build(jobId: number, startPosition: Vector3, endPosition: Vector3): IJob {
    let job: IJob;

    switch(jobId) {
      default:
      case 1:
        endPosition.y = startPosition.y;
        endPosition.z = 0;
        startPosition.z = 0;
        job = new DigJob(startPosition, endPosition);
      break;
      case 2:
        endPosition.x = startPosition.x;
        endPosition.z = 0;
        startPosition.z = 0;
        job = new CraftStairJob(startPosition, endPosition);
      break;
    }

    return job;
  }
}

export { JobFactory };