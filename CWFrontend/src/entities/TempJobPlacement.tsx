import * as THREE from 'three';
import { TextureService } from '_services/index';
import { IEntity, IWithTextureService } from '_entities/index';

class TempJobPlacement implements IEntity, IWithTextureService {
  position: THREE.Vector3;
  canPlace: boolean
  object: THREE.Mesh<THREE.BufferGeometry, THREE.Material | THREE.Material[]>;
  texture: THREE.Texture;
  height: number;
  width: number;
  textureHeight: number = 48;
  textureWidth: number = 97;
  textureUnitSize: number = 48;

  constructor(position: THREE.Vector3, canPlace: boolean) {
    this.texture = TextureService.Instance.GetTexture('TempJobPlacement');
    this.position = position;
    this.object = new THREE.Mesh();
    this.height = 1;
    this.width = 1;
    this.canPlace = canPlace;
  }

  BuildObject() {
    this.object.geometry = new THREE.PlaneGeometry(this.width, this.height);
    this.object.material = this.CreateMaterial();
    this.object.position.copy(this.position);
    this.object.position.x += 0.5;
    this.object.position.y += 0.5;
    this.object.position.z = 0.000015;

    if (this.canPlace) {
      this.texture.offset.x = 1 / this.textureWidth * ((this.textureUnitSize * 1) + 1);
      this.texture.offset.y = 1 / this.textureHeight;
    } else {
      this.texture.offset.x = 1 / this.textureWidth;
      this.texture.offset.y = 1 / this.textureHeight;
    }

    this.texture.repeat.x = 1 / this.textureWidth * (this.textureUnitSize * this.width);
    this.texture.repeat.y = 1 / this.textureHeight * (this.textureUnitSize * this.height);

    return this.object;
  }

  CreateMaterial(): THREE.Material {
    return new THREE.MeshBasicMaterial({ 
      map: this.texture, 
      depthTest: false, 
      transparent: true 
    });
  }

  Destroy() {
    this.texture.dispose();
    this.object.remove();
  }
}

export { TempJobPlacement };