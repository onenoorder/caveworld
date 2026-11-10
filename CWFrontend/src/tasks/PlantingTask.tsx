import { Task } from '_tasks/index';
import { IDwarf } from '_entities/dwarfs/index';
import { PlantingGoal, IGoal } from '_goals/index';
import { IPlant } from '_buildings/index';

// CAV-004: the single task of a PlantingJob — walking to the plant cell is
// the whole job (architecture D3); arrival completes the planting.
export class PlantingTask extends Task {
  plant: IPlant;

  constructor(plant: IPlant) {
    super();
    this.plant = plant;
  }

  CreateGoal(dwarf: IDwarf): IGoal {
    return new PlantingGoal(dwarf, this.plant);
  }
}
