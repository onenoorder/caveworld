import { Vector3, MeshBasicMaterial, Material } from 'three';
import { TextureService } from '_services/index';
import { House } from '.';

class MainHouse extends House {
  constructor(position: Vector3) {
    super('MainHouse', position, 3, 4, 1.5, 10);
    this.state = 4;
  }

  CreateMaterial(): Material {
    return new MeshBasicMaterial({ 
      map: TextureService.Instance.GetBuildingTexture(this.name),
      depthTest: false,
      transparent: true
    });
  }

  Tick(delta: number) {
  }
}

export { MainHouse };