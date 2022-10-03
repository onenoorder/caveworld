import { ConstructScaffoldTask, ConstructBuildingTask, DeconstructScaffoldTask } from '_tasks/index';
import { IBuilding } from '_entities/index';
import { Job } from '_jobs/index';
import { IDwarf } from '_entities/dwarfs';
import { IGoal } from '_goals/index';

class BuildingConstructionJob extends Job {
  building: IBuilding;
  constructScaffoldTask: ConstructScaffoldTask;
  deconstructScaffoldTask: DeconstructScaffoldTask;
  
  constructor(building: IBuilding) {
    super(building.position, building.height, building.width, building.name, 0, (building.height * building.width) / 2);

    this.building = building;

    this.deconstructScaffoldTask = new DeconstructScaffoldTask(this.building);
    this.tasks.Push(this.deconstructScaffoldTask);

    for (let count = 0; count <= building.height * building.width; count++) {
      this.tasks.Push(new ConstructBuildingTask(this.building));
    }

    this.constructScaffoldTask = new ConstructScaffoldTask(this.building, this.deconstructScaffoldTask);
    this.tasks.Push(this.constructScaffoldTask);
  }

  Work(dwarf: IDwarf): IGoal | null {
    if (this.constructScaffoldTask.IsCompleted()) {
      return super.Work(dwarf);
    } else if (!this.constructScaffoldTask.IsActivate()) {
      return super.Work(dwarf);
    }

    return null;
  }

  IsCompleted(): boolean {
    return this.deconstructScaffoldTask.IsCompleted();
  }

  IsFull(): boolean {
    return this.constructScaffoldTask.IsActivate() || this.deconstructScaffoldTask.IsActivate() || super.IsFull();
  }
}

export { BuildingConstructionJob };