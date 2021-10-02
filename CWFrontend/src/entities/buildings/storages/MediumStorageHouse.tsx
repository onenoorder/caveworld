import { Vector3 } from "three";
import { Storage } from ".";

class MediumStorageHouse extends Storage {
	constructor(position: Vector3) {
    super('MediumStorageHouse', position, 2, 4, 1, 24, 4);
  }
}

export { MediumStorageHouse };