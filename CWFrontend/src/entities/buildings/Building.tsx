import * as THREE from 'three';
import { MeshBasicMaterial, Vector3 } from 'three';
import { IBuilding } from '.';
import { TextureService } from '_services/index';

abstract class Building implements IBuilding {
  position: THREE.Vector3;
  object: THREE.Mesh<THREE.BufferGeometry, THREE.Material | THREE.Material[]>;
  height: number;
  width: number;
  name: string;
  door: number;
  state: number = 0;
  buildProgress: number = 0;
  buildTotal: number;

  constructor(name: string, position: THREE.Vector3, height: number, width: number, door: number) {
    this.position = position;
    this.height = height;
    this.width = width;
    this.name = name;
    this.door = door;
    this.buildTotal = height * width * 10;
    this.object = new THREE.Mesh();
  }

  BuildObject() {
    const geometry = new THREE.PlaneGeometry(this.width, this.height);
    this.object = new THREE.Mesh(geometry, this.CreateMaterial());
    this.object.position.x += this.position.x + (this.width / 2);
    this.object.position.y += this.position.y + (this.height / 2);
    return this.object;
  }

  CreateMaterial(): THREE.Material {
    return new THREE.MeshBasicMaterial({ color: 0xffff00 });
  }

  GetDoorPosition(): THREE.Vector3 {
    let doorPosition = this.position.clone();
    doorPosition.x += this.door;
    return doorPosition;
  }

  GetLeftCorner(): THREE.Vector3 {
    return this.position.clone();
  }

  GetRightCorner(): THREE.Vector3 {
    return this.GetLeftCorner().add(new Vector3(this.width - 1));
  }

  Build(delta: number) {
    this.buildProgress += delta;

    if (this.state < 1 && this.buildProgress >= this.buildTotal * 0.25) {
      this.state = 1;
      (this.object.material as MeshBasicMaterial).map = TextureService.Instance.GetBuildingTextureWithState(this.name, this.state);
    } else if (this.state < 2 && this.buildProgress >= this.buildTotal * 0.50) {
      this.state = 2;
      (this.object.material as MeshBasicMaterial).map = TextureService.Instance.GetBuildingTextureWithState(this.name, this.state);
    } else if (this.state < 3 && this.buildProgress >= this.buildTotal * 0.75) {
      this.state = 3;
      (this.object.material as MeshBasicMaterial).map = TextureService.Instance.GetBuildingTextureWithState(this.name, this.state);
    } else if (this.state < 4 && this.IsBuild()) {
      this.state = 4;
      (this.object.material as MeshBasicMaterial).map = TextureService.Instance.GetBuildingTextureWithState(this.name, this.state);
    }
  }

  IsBuild(): boolean {
    return this.buildProgress >= this.buildTotal;
  }

  Tick(delta: number): void {}

  Destroy() {
    this.object.clear();
  }
}

export { Building };