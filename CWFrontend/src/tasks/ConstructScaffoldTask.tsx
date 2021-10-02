import { Task } from '_tasks/index';
import { IDwarf } from '_entities/dwarfs/index';
import { ConstructScaffoldGoal, IGoal } from '_goals/index';
import { IBuilding } from '_entities/buildings/index';

export class ConstructScaffoldTask extends Task {
  building: IBuilding;

  constructor(building: IBuilding) {
    super();
    this.building = building;
  }

  CreateGoal(dwarf: IDwarf): IGoal {
    return new ConstructScaffoldGoal(dwarf, this.building);
  }
}