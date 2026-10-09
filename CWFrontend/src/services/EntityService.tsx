import * as THREE from 'three';
import { JobService, MapService } from '_services/index';
import { IHouse } from '_houses/index';
import { IDwarf } from '_dwarfs/index';
import { IBuilding } from '_buildings/index';
import { IConstruction } from '_constructions/index';
import { IJob } from '_jobs/index';
import { ConstructionFactory } from '_factories/ConstructionFactory';
import { IEntity, Scaffold, Stair } from '_entities/index';

class EntityService {
  scene: THREE.Scene;
  buildings: IBuilding[];
  constructions: IConstruction[];
  stairs: Stair[];
  houses: IHouse[];
  dwarfs: IDwarf[];

  public static Instance: EntityService;

  private constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.buildings = [];
    this.constructions = [];
    this.stairs = [];
    this.houses = [];
    this.dwarfs = [];
  }

  public static Setup(scene: THREE.Scene) {
    if (EntityService.Instance)
      EntityService.Instance.Destroy();

    EntityService.Instance = new EntityService(scene);
  }

  TryAddBuilding(building: IBuilding) {
    let canPlace = MapService.Instance.CanPlace(building.position, building.height, building.width);

    if (canPlace) {
      this.AddBuilding(building);
    }

    return canPlace;
  }

  AddBuilding(building: IBuilding) {
    if (this.IsHouse(building)) {
      this.houses.push(building as IHouse);
    }

    this.buildings.push(building);
    this.scene.add(building.BuildObject());
    MapService.Instance.Build(building.position, building.height, building.width);

    if (this.buildings.length > 1) {
      let construction = ConstructionFactory.Build(building);
      this.AddConstruction(construction);
    }
  }

  AddConstruction(construction: IConstruction) {
    this.constructions.push(construction);
    this.scene.add(construction.BuildObject());
  }

  RemoveConstruction(construction: IConstruction) {
    const index = this.constructions.indexOf(construction, 0);
		if (index > -1) {
			this.constructions.splice(index, 1);
      this.scene.remove(construction.object);
		}
  }

  AddScaffold(scaffold: Scaffold) {
    this.scene.add(scaffold.BuildObject());
  }

  RemoveScaffold(scaffold: Scaffold) {
    this.scene.remove(scaffold.object);
  }

  IsHouse(building: IBuilding): boolean {
    return 'residence' in building;
  }

  AddDwarf(dwarf: IDwarf) {
    this.dwarfs.push(dwarf);
    this.scene.add(dwarf.BuildObject());
  }

  AddJob(job: IJob) {
    JobService.Instance.AddJob(job);
    //this.scene.add(job.BuildObject());
  }

  AddStair(stair: Stair) {
    this.stairs.push(stair);
    this.scene.add(stair.BuildObject());
    MapService.Instance.Build(stair.position, 1, 1);
    MapService.Instance.SetClimbable(stair.position);
  }

  HasStair(position: THREE.Vector3) : Boolean {
    this.stairs.forEach((stair) => {
      if (stair.position.x === position.x && stair.position.y === position.y) {
        return true;
      }
    });

    return false;
  }

  GetEntityAtPosition(position: THREE.Vector3): IEntity | null {
    let entity: IEntity | null = null;

    for (let index = 0; index < this.buildings.length; index++) {
      entity = this.buildings[index];
      if (Math.floor(entity.position.x) === position.x && Math.floor(entity.position.y) === position.y)
        return entity;
    }

    for (let index = 0; index < this.dwarfs.length; index++) {
      entity = this.dwarfs[index];
      if (Math.floor(entity.position.x) === position.x && Math.floor(entity.position.y) === position.y)
        return entity;
    }

    for (let index = 0; index < this.stairs.length; index++) {
      entity = this.stairs[index];
      if (Math.floor(entity.position.x) === position.x && Math.floor(entity.position.y) === position.y)
        return entity;
    }

    return null;
  }

  Destroy() {
    this.buildings.forEach((building) => {
      building.Destroy();
    });

    this.constructions.forEach((construction) => {
      construction.Destroy();
    });

    this.dwarfs.forEach((dwarf) => {
      dwarf.Destroy();
    });
  }

  Tick(delta: number) {
    this.buildings.forEach((building) => {
      building.Tick(delta);
    });

    this.constructions.forEach((construction) => {
      construction.Tick(delta);
      if (construction.IsCompleted()) {
        this.RemoveConstruction(construction);
      }
    });

    this.dwarfs.forEach((dwarf) => {
      dwarf.Tick(delta);
    });
  }
}

export { EntityService };