import { Vector3 } from 'three';
import { EntityService } from '.';
import { DwarfFactory } from '_factories/index';

class SpawnService {
  position: Vector3;
  status: number = Infinity;

  public static Instance: SpawnService;

  constructor(position: Vector3) {
    this.position = position;

    SpawnService.Instance = this;
  }

  TrySpawn() {
    let totalPop = 0;

    EntityService.Instance.houses.forEach(house => {
      totalPop += house.GetLimit() - house.residence.length;
    });

    if (EntityService.Instance.dwarfs.length < totalPop) {
      let dwarfId = Math.floor(Math.random() * 3);
      let dwarf = DwarfFactory.Build(dwarfId, this.position.clone());
      EntityService.Instance.AddDwarf(dwarf);
    }
  }

  Tick(delta: number) {
    if (this.status > 30) {
      this.TrySpawn();
      this.status = 0;
    } else {
      this.status += delta;
    }
  }
}

export { SpawnService };