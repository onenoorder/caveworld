import { IDwarf } from '_entities/dwarfs/index';
import { IBuilding } from '_entities/buildings/index';

export interface IStorage extends IBuilding {
  workers: IDwarf[];
	maxWorkers: number;
	storageLimit: number;

	Add(dwarf: IDwarf): any;
	Remove(dwarf: IDwarf): any;
}