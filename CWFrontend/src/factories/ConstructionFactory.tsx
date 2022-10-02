import { IConstruction, BuildingConstruction } from '_constructions/index';
import { IBuilding } from '_buildings/index';

class ConstructionFactory {
  public static Build(building: IBuilding): IConstruction {
    let construction: IConstruction;

    construction = new BuildingConstruction(building);

    return construction;
  }
}

export { ConstructionFactory };