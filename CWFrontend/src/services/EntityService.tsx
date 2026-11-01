import * as THREE from 'three';
import { JobService, MapService, ScaffoldService } from '_services/index';
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
    ScaffoldService.Instance.AddScaffold(scaffold);
  }

  RemoveScaffold(scaffold: Scaffold) {
    ScaffoldService.Instance.RemoveScaffold(scaffold);
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
    return this.stairs.some((stair) => {
      return stair.position.x === position.x && stair.position.y === position.y;
    });
  }

    GetEntityAtPosition(position: THREE.Vector3): IEntity | null {
    const cellX = Math.floor(position.x);
    const cellY = Math.floor(position.y);

    // Dwarfs are resolved first: they render in front of every other entity
    // (renderOrder 999, depthTest disabled), so when a dwarf stands in front
    // of a building the cursor must target the dwarf, not the building whose
    // footprint also covers the cell.
    for (let index = 0; index < this.dwarfs.length; index++) {
      // Dwarfs move on fractional positions while their sprite spans exactly
      // one cell around its centre ([p, p+1]). Math.round resolves the cell
      // holding the majority of the sprite (the cell the dwarf is visually
      // "on"), so the hitbox tracks the visible dwarf instead of lagging one
      // cell behind whenever the fractional part passes 0.5.
      if (Math.round(this.dwarfs[index].position.x) === cellX &&
          Math.round(this.dwarfs[index].position.y) === cellY)
        return this.dwarfs[index];
    }

    for (let index = 0; index < this.stairs.length; index++) {
      if (Math.floor(this.stairs[index].position.x) === cellX && Math.floor(this.stairs[index].position.y) === cellY)
        return this.stairs[index];
    }

    // Buildings are selectable across their whole footprint, not just their
    // origin cell: cells [x, x + width) x [y, y + height) — the same
    // convention MapService.Build uses to mark the grid.
    for (let index = 0; index < this.buildings.length; index++) {
      const building = this.buildings[index];
      if (cellX >= Math.floor(building.position.x) &&
          cellX < Math.floor(building.position.x) + building.width &&
          cellY >= Math.floor(building.position.y) &&
          cellY < Math.floor(building.position.y) + building.height)
        return building;
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