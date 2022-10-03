import { Task } from '_tasks/index';
import { IDwarf } from '_dwarfs/index';
import { DeconstructScaffoldingGoal, IGoal } from '_goals/index';
import { IBuilding } from '_buildings/index';
import { Scaffold } from '_entities/index';
import { IQueue, Queue } from '_utilities/Queue';
import { IAddScaffold } from '_utilities/IAddScaffold';

export class DeconstructScaffoldTask extends Task implements IAddScaffold {
  building: IBuilding;
  scaffolds: IQueue<Scaffold>;

  constructor(building: IBuilding) {
    super();

    this.building = building;
    this.scaffolds = new Queue<Scaffold>();
  }

  IsActivate(): boolean {
    return super.IsActivate() && this.goal?.dwarf !== undefined;
  }

  CreateGoal(dwarf: IDwarf): IGoal {
    return new DeconstructScaffoldingGoal(dwarf, this.building, this.scaffolds);
  }

  AddScaffold(scaffold: Scaffold) {
    this.scaffolds.Enqueue(scaffold);
  }
}