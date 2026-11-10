import * as THREE from 'three';
import { Plant, SeedCellSource } from '_buildings/index';
import { IPlant } from '_buildings/index';

// CAV-004: Bamboo — mature footprint 1 wide x 2 tall; the nursery sheet
// sheets/Bamboo Nursery.png measures 39 frames of 48 px (frame 38 mature),
// so growth runs Bamboo0.png .. Bamboo37.png + Bamboo.png over 38 minutes.
class Bamboo extends Plant {
  constructor(position: THREE.Vector3, seedCellSource?: SeedCellSource) {
    super('Bamboo', position, 2, 1, 39, seedCellSource);
  }

  Seed(cell: THREE.Vector3): IPlant {
    // Seeded plants are planted by definition (architecture D6): visible at
    // frame 0 with growth + seeding running — no dwarf, no PlantingJob.
    const offspring = new Bamboo(cell);
    offspring.Plant();
    return offspring;
  }
}

export { Bamboo };
