import { Vector3 } from "three";
import { Storage } from ".";

class BigStorageHouse extends Storage {
	constructor(position: Vector3) {
    super('BigStorageHouse', position, 3, 4, 1, 48, 6);
  }
}

export { BigStorageHouse };