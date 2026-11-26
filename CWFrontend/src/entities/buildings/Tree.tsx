import * as THREE from 'three';
import { Plant, SeedCellSource } from '_buildings/index';
import { IPlant } from '_buildings/index';

// CAV-004: Tree — mature footprint 1 wide x 3 tall; growth uses Tree0.png
// .. Tree14.png from sheets, then the preserved mature Tree.png at 15 minutes.
class Tree extends Plant {
  constructor(position: THREE.Vector3, seedCellSource?: SeedCellSource) {
    super('Tree', position, 3, 1, 16, seedCellSource);
  }

  Seed(cell: THREE.Vector3): IPlant {
    // Seeded plants are planted by definition (architecture D6): visible at
    // frame 0 with growth + seeding running — no dwarf, no PlantingJob.
    const offspring = new Tree(cell);
    offspring.Plant();
    return offspring;
  }
}

export { Tree };
