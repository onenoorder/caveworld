import { IConstruction, BuildingConstruction, CraftingConstruction } from '_constructions/index';
import { IBuilding } from '_buildings/index';
import { IJob } from 'jobs';

class ConstructionFactory {
  public static Build(building: IBuilding): IConstruction {
    let construction: IConstruction;

    construction = new BuildingConstruction(building);

    return construction;
  }

  public static BuildFromJob(job: IJob): IConstruction {
    let construction: IConstruction;

    construction = new CraftingConstruction(job);

    return construction;
  }
}

export { ConstructionFactory };