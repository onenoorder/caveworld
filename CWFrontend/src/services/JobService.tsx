import { IDwarf } from '_entities/dwarfs/index';
import { IJob } from '_jobs/index';

export class JobService {
  jobs: IJob[];

  public static Instance: JobService;

  private constructor() {
    this.jobs = [];
  }

  public static Setup() {
    if (JobService.Instance)
      JobService.Instance.Destroy();

    JobService.Instance = new JobService();
  }

  AddJob(job: IJob) {
    this.jobs.push(job);
  }

  Remove(job: IJob) {
		const index = this.jobs.indexOf(job, 0);
		if (index > -1) {
			this.jobs.splice(index, 1);
		}
	}

  Find(dwarf: IDwarf): IJob | null {
    let foundJob: IJob | null = null;
    let jobsForRemoval: IJob[] = [];
    
    this.jobs.forEach(job => {
      if (job.IsCompleted()) {
        jobsForRemoval.push(job);
      } else if (!job.IsFull()) {
        if (foundJob) {
          if (job.position.distanceTo(dwarf.position) < foundJob.position.distanceTo(dwarf.position)) {
            foundJob = job;
          }
        } else {
          foundJob = job;
        }
      }
    });

    jobsForRemoval.forEach(job => this.Remove(job));

    return foundJob;
  }

  Destroy() {
  }
}