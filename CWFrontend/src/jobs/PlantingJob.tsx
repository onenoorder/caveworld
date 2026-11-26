import { Job } from '_jobs/index';
import { PlantingTask } from '_tasks/index';
import { IPlant } from '_buildings/index';

// CAV-004: minimal one-task job for planting (architecture D3). The job
// remains active until its walk-and-plant task completes.
class PlantingJob extends Job {
  private plantingTask: PlantingTask;

  constructor(plant: IPlant) {
    super(plant.position, plant.height, plant.width, plant.name, 0, 1);

    this.plantingTask = new PlantingTask(plant);
    this.tasks.Push(this.plantingTask);
  }

  IsCompleted(): boolean {
    return this.plantingTask.IsCompleted();
  }
}

export { PlantingJob };
