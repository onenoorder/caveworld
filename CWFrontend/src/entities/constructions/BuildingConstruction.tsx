import { BuildingConstructionJob } from '_jobs/index';
import { Construction } from './Construction';
import { IBuilding } from '_buildings/index';
import { ConstructionType, Direction } from '_utilities/Enums';

class BuildingConstruction extends Construction {
  building: IBuilding;

	constructor(building: IBuilding) {
    super(building.position, building.height, building.width, Direction.LEFT, ConstructionType.BUILDING, new BuildingConstructionJob(building));

    this.building = building;
  }
}

export { BuildingConstruction };