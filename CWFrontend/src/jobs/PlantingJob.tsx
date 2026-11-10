import { Job } from '_jobs/index';
import { PlantingTask } from '_tasks/index';
import { IPlant } from '_buildings/index';

// CAV-004: minimal one-task job for planting (architecture D3). No
// overrides: IsCompleted() inherits (tasks stack empty after the single
// task is handed out) and dwarfsLimit = 1 (one dwarf plants one plant).
class PlantingJob extends Job {
  constructor(plant: IPlant) {
    super(plant.position, plant.height, plant.width, plant.name, 0, 1);

    this.tasks.Push(new PlantingTask(plant));
  }
}

export { PlantingJob };
