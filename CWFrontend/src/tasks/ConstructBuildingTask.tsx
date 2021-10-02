import { Task } from '_tasks/index';
import { IDwarf } from '_entities/dwarfs/index';
import { ConstructBuildingGoal, IGoal } from '_goals/index';
import { IBuilding } from '_entities/buildings/index';

export class ConstructBuildingTask extends Task {
  building: IBuilding;

  constructor(building: IBuilding) {
    super();
    this.building = building;
  }

  CreateGoal(dwarf: IDwarf): IGoal {
    return new ConstructBuildingGoal(dwarf, this.building);
  }
}