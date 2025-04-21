import { IDwarf } from '_entities/dwarfs/IDwarf';
import { IBuilding } from '_entities/buildings/IBuilding';

export interface IFactory extends IBuilding {
  workers: IDwarf[];
	limit: number;

	Add(dwarf: IDwarf): any;
	Remove(dwarf: IDwarf): any;
	GetLimit(): number;
}