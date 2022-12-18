import { IJob } from '_jobs/index';
import { Construction } from './Construction';
import { ConstructionType, Direction } from '_utilities/Enums';

class CraftingConstruction extends Construction {
  job: IJob;

	constructor(job: IJob) {
    super(job.position, job.height, job.width, Direction.LEFT, ConstructionType.DIG, job);

    this.job = job;
  }
}

export { CraftingConstruction };