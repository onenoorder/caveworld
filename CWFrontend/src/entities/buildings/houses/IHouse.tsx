import { IDwarf } from '_entities/dwarfs/index';
import { IBuilding } from '_entities/buildings/index';

export interface IHouse extends IBuilding {
  residence: IDwarf[];
	limit: number;

	Add(dwarf: IDwarf): any;
	Remove(dwarf: IDwarf): any;
	GetLimit(): number;
}