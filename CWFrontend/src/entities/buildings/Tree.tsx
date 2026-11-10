import * as THREE from 'three';
import { Plant, SeedCellSource } from '_buildings/index';
import { IPlant } from '_buildings/index';

// CAV-004: Tree — mature footprint 1 wide x 3 tall; the nursery sheet
// sheets/Tree Nursery.png measures 18 frames of 48 px (frame 17 mature),
// so growth runs Tree0.png .. Tree16.png + Tree.png over 17 minutes.
class Tree extends Plant {
  constructor(position: THREE.Vector3, seedCellSource?: SeedCellSource) {
    super('Tree', position, 3, 1, 18, seedCellSource);
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
