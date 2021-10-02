import * as THREE from 'three';
import { JobService, MapService } from '_services/index';
import { IHouse } from '_entities/buildings/houses/index';
import { IDwarf } from '_entities/dwarfs/index';
import { IBuilding } from '_entities/buildings/index';
import { BuildJob, IJob } from '_jobs/index';

class EntityService {
  scene: THREE.Scene;
  buildings: IBuilding[];
  houses: IHouse[];
  dwarfs: IDwarf[];

  public static Instance: EntityService;

  private constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.buildings = [];
    this.houses = [];
    this.dwarfs = [];
  }

  public static Setup(scene: THREE.Scene) {
    if (EntityService.Instance)
      EntityService.Instance.Destroy();

    EntityService.Instance = new EntityService(scene);
  }

  TryAddBuilding(building: IBuilding, buildingId: number) {
    let canPlace = MapService.Instance.CanPlace(building.position, building.height, building.width);

    if (canPlace) {
      if (buildingId < 6) {
        this.houses.push(building as IHouse);
      }
      this.buildings.push(building);
      this.scene.add(building.BuildObject());
      MapService.Instance.Build(building.position, building.height, building.width);
      if (buildingId > 0)
        JobService.Instance.AddJob(new BuildJob(building));
    }

    return canPlace;
  }

  AddDwarf(dwarf: IDwarf) {
    this.dwarfs.push(dwarf);
    this.scene.add(dwarf.BuildObject());
  }

  AddJob(job: IJob) {
    JobService.Instance.AddJob(job);
    //this.scene.add(job.BuildObject());
  }

  Destroy() {
    this.buildings.forEach((building) => {
      building.Destroy();
    });

    this.dwarfs.forEach((dwarf) => {
      dwarf.Destroy();
    });
  }

  Tick(delta: number) {
    this.buildings.forEach((building) => {
      building.Tick(delta);
    });

    this.dwarfs.forEach((dwarf) => {
      dwarf.Tick(delta);
    });
  }
}

export { EntityService };