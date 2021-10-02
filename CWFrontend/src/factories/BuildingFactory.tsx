import { Vector3 } from 'three';
import { TinyHouse, SmallHouse, MediumHouse, HugeHouse, BigHouse } from '_houses/index';
import { IBuilding } from '_buildings/index';
import { MediumStorageHouse, SmallStorageHouse, BigStorageHouse } from '_storages/index';

class BuildingFactory {
  public static Build(buildingId: number, position: Vector3): IBuilding {
    let building: IBuilding;

    switch(buildingId) {
      default:
      case 1:
        building = new TinyHouse(position);
      break;
      case 2:
        building = new SmallHouse(position);
      break;
      case 3:
        building = new MediumHouse(position);
      break;
      case 4:
        building = new BigHouse(position);
      break;
      case 5:
        building = new HugeHouse(position);
      break;
      case 6:
        building = new SmallStorageHouse(position);
      break;
      case 7:
        building = new MediumStorageHouse(position);
      break;
      case 8:
        building = new BigStorageHouse(position);
      break;
    }

    return building;
  }
}

export { BuildingFactory };