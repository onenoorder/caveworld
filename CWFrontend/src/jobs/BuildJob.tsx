import { ConstructScaffoldTask, ConstructBuildingTask, ITask } from '_tasks/index';
import { IBuilding } from '_entities/index';
import { Job } from '_jobs/index';
import { IDwarf } from '_entities/dwarfs';
import { IGoal } from '_goals/index';

class BuildJob extends Job {
  building: IBuilding;
  scaffoldTask: ITask;
  
  constructor(building: IBuilding) {
    super(building.position, building.height, building.width, building.name, 0, 3);

    this.building = building;

    this.tasks.Push(new ConstructBuildingTask(this.building));
    this.tasks.Push(new ConstructBuildingTask(this.building));
    this.tasks.Push(new ConstructBuildingTask(this.building));
    this.tasks.Push(new ConstructBuildingTask(this.building));
    this.tasks.Push(new ConstructBuildingTask(this.building));
    this.tasks.Push(new ConstructBuildingTask(this.building));
    this.tasks.Push(new ConstructBuildingTask(this.building));
    this.tasks.Push(new ConstructBuildingTask(this.building));
    this.tasks.Push(new ConstructBuildingTask(this.building));
    this.tasks.Push(new ConstructBuildingTask(this.building));

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

export { BuildJob };