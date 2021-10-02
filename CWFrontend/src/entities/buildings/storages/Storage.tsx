import { Vector3, MeshBasicMaterial, Material } from 'three';
import { TextureService } from '_services/index';
import { Building } from '_buildings/index';
import { IDwarf } from '_dwarfs/index';
import { IStorage } from '.';

class Storage extends Building implements IStorage {
  workers: IDwarf[];
	maxWorkers: number;
	storageLimit: number;
	state: number = 0;
  status: number = 0;

	constructor(name: string, position: Vector3, height: number, width: number, door: number, storageLimit: number, maxWorkers: number) {
		super(name, position, height, width, door);

		this.storageLimit = storageLimit;
		this.maxWorkers = maxWorkers;
		this.workers = [];
	}

	Add(dwarf: IDwarf) {
		this.workers.push(dwarf);
	}

	Remove(dwarf: IDwarf) {
		const index = this.workers.indexOf(dwarf, 0);
		if (index > -1) {
			this.workers.splice(index, 1);
		}
	}

	GetLimit(): number {
		return this.state === 4 ? this.maxWorkers : 0;
	}

	CreateMaterial(): Material {
    return new MeshBasicMaterial({ 
      map: TextureService.Instance.GetBuildingTextureWithState(this.name, this.state), 
      depthTest: false, 
      transparent: true 
    });
  }
}

export { Storage };