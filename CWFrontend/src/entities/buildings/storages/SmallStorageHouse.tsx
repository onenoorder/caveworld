import { Vector3 } from "three";
import { Storage } from ".";

class SmallStorageHouse extends Storage {
	constructor(position: Vector3) {
    super('SmallStorageHouse', position, 2, 2, 1, 12, 2);
  }
}

export { SmallStorageHouse };