import { Vector3, MeshBasicMaterial, Material } from 'three';
import { TextureService } from '_services/index';
import { Building } from '_buildings/index';
import { IDwarf } from '_dwarfs/index';
import { IFactory } from './IFactory';

abstract class Factory extends Building implements IFactory {
  workers: IDwarf[];
	limit: number;
	state: number = 0;

	constructor(name: string, position: Vector3, height: number, width: number, door: number, limit: number) {
		super(name, position, height, width, door);

		this.limit = limit;
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
		return this.state === 4 ? this.limit : 0;
	}

	CreateMaterial(): Material {
    return new MeshBasicMaterial({ 
      map: TextureService.Instance.GetBuildingTextureWithState(this.name, this.state), 
      depthTest: false, 
      transparent: true 
    });
  }
}

export { Factory };