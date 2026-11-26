import * as THREE from 'three';
import { Plant, SeedCellSource } from '_buildings/index';
import { IPlant } from '_buildings/index';

// CAV-004: Bamboo — mature footprint 1 wide x 2 tall; sheets/Bamboo0.png
// through sheets/Bamboo35.png provide the growth frames, followed by the
// mature Bamboo.png.
class Bamboo extends Plant {
  constructor(position: THREE.Vector3, seedCellSource?: SeedCellSource) {
    super('Bamboo', position, 2, 1, 37, seedCellSource);
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
