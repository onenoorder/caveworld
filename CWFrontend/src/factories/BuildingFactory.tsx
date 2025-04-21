import { Vector3 } from 'three';
import { TinyHouse, SmallHouse, MediumHouse, HugeHouse, BigHouse } from '_houses/index';
import { IBuilding } from '_buildings/index';
import { MediumStorageHouse, SmallStorageHouse, BigStorageHouse } from '_storages/index';
import { Woodworks, Stoneworks, Steelworks, Waterworks, ToolFactory, CogwheelFactory, FoodFactory, CharcoalBurner, Laboratory, CrystalLoadingstation } from '_buildings/factories/index';
import { BuildingIds } from '_utilities/Enums';

class BuildingFactory {
  public static Build(buildingId: BuildingIds, position: Vector3): IBuilding {
    let building: IBuilding;

    switch(buildingId) {
      default:
      case BuildingIds.TinyHouse:
        building = new TinyHouse(position);
      break;
      case BuildingIds.SmallHouse:
        building = new SmallHouse(position);
      break;
      case BuildingIds.MediumHouse:
        building = new MediumHouse(position);
      break;
      case BuildingIds.BigHouse:
        building = new BigHouse(position);
      break;
      case BuildingIds.HugeHouse:
        building = new HugeHouse(position);
      break;

      case BuildingIds.SmallStorageHouse:
        building = new SmallStorageHouse(position);
      break;
      case BuildingIds.MediumStorageHouse:
        building = new MediumStorageHouse(position);
      break;
      case BuildingIds.BigStorageHouse:
        building = new BigStorageHouse(position);
      break;

      case BuildingIds.Woodworks:
        building = new Woodworks(position);
      break;
      case BuildingIds.Stoneworks:
        building = new Stoneworks(position);
      break;
      case BuildingIds.Steelworks:
        building = new Steelworks(position);
      break;
      case BuildingIds.Waterworks:
        building = new Waterworks(position);
      break;
      case BuildingIds.ToolFactory:
        building = new ToolFactory(position);
      break;
      case BuildingIds.CogwheelFactory:
        building = new CogwheelFactory(position);
      break;
      case BuildingIds.FoodFactory:
        building = new FoodFactory(position);
      break;
      case BuildingIds.CharcoalBurner:
        building = new CharcoalBurner(position);
      break;
      case BuildingIds.Laboratory:
        building = new Laboratory(position);
      break;
      case BuildingIds.CrystalLoadingstation:
        building = new CrystalLoadingstation(position);
      break;
    }

    return building;
  }
}

export { BuildingFactory };