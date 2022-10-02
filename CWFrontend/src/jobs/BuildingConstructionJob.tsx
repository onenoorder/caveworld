import { ConstructScaffoldTask, ConstructBuildingTask, ITask } from '_tasks/index';
import { IBuilding } from '_entities/index';
import { Job } from '_jobs/index';
import { IDwarf } from '_entities/dwarfs';
import { IGoal } from '_goals/index';

class BuildingConstructionJob extends Job {
  building: IBuilding;
  scaffoldTask: ITask;
  
  constructor(building: IBuilding) {
    super(building.position, building.height, building.width, building.name, 0, (building.height * building.width) / 2);

    this.building = building;

    for (let count = 0; count <= building.height * building.width; count++) {
      this.tasks.Push(new ConstructBuildingTask(this.building));
    }

    this.scaffoldTask = new ConstructScaffoldTask(this.building);
    this.tasks.Push(this.scaffoldTask);
  }

  Work(dwarf: IDwarf): IGoal | null {
    if (this.scaffoldTask.IsCompleted()) {
      return super.Work(dwarf);
    } else if (!this.scaffoldTask.IsActivate()) {
      return super.Work(dwarf);
    }
    return null;
  }
}

export { BuildingConstructionJob };