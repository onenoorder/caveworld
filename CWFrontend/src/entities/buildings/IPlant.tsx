import { Vector3 } from 'three';
import { IBuilding } from '_buildings/index';

// CAV-004: contract between a seeding plant and the registration entry —
// the plant knows how to create its own seeded offspring at a cell.
export interface IPlant extends IBuilding {
  planted: boolean;
  Plant(): void;
  Seed(cell: Vector3): IPlant;
}
