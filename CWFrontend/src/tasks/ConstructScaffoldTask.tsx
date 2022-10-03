import { Task } from '_tasks/index';
import { IDwarf } from '_dwarfs/index';
import { ConstructScaffoldingGoal, IGoal } from '_goals/index';
import { IBuilding } from '_buildings/index';
import { IAddScaffold } from '_utilities/IAddScaffold';

export class ConstructScaffoldTask extends Task {
  building: IBuilding;
  addScaffold: IAddScaffold;

  constructor(building: IBuilding, addScaffold: IAddScaffold) {
    super();

    this.building = building;
    this.addScaffold = addScaffold;
  }

  IsActivate(): boolean {
    return super.IsActivate() && this.goal?.dwarf !== undefined;
  }

  CreateGoal(dwarf: IDwarf): IGoal {
    return new ConstructScaffoldingGoal(dwarf, this.building, this.addScaffold);
  }
}