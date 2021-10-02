import { IEntity } from '_entities/index';
import * as THREE from 'three';

class Map implements IEntity {
  position: THREE.Vector3;
  object: THREE.Mesh<THREE.BufferGeometry, THREE.Material | THREE.Material[]>;
  height: number;
  width: number;

  constructor(height: number, width: number) {
    this.position = new THREE.Vector3();
    this.height = height;
    this.width = width;
    this.object = new THREE.Mesh();
  }

  BuildObject() {
    this.object.geometry = new THREE.PlaneGeometry(this.width, this.height, this.width, this.height);
    this.object.material = this.CreateMaterial();

    this.object.position.x += this.position.x + (this.width / 2);
    this.object.position.y += this.position.y + (this.height / 2);

    return this.object;
  }

  Destroy() {
    this.object.clear();
  }

  CreateMaterial(): THREE.Material {
    return new THREE.MeshBasicMaterial({ 
      color: 0x271e11/*,
      wireframe: true*/
    });
  }
}

export { Map };