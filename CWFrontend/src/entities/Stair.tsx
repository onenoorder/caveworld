import { BufferGeometry, Material, Mesh, MeshBasicMaterial, PlaneGeometry, Vector3 } from 'three';
import { TextureService } from '_services/index';
import { IWithTextureService } from '_entities/index';

class Stair implements IWithTextureService {
	position: Vector3;
	object: Mesh<BufferGeometry, Material | Material[]>;
  state: number = 0;
  buildProgress: number = 0;
	name: string = 'Stair';

	constructor(position: Vector3) {
    this.position = position;
    this.position.z = 0.00001;
    this.object = new Mesh();
  }

	BuildObject() {
    const geometry = new PlaneGeometry(1, 1);
    this.object = new Mesh(geometry, this.CreateMaterial());

    this.object.position.x += this.position.x + 0.5;
    this.object.position.y += this.position.y + 0.5;
    
    return this.object;
  }

  CreateMaterial(): Material {
    return new MeshBasicMaterial({ 
      map: TextureService.Instance.GetScaffoldTexture(this.state), 
      depthTest: false,
      transparent: true
    });
  }

  Build(delta: number) {
    this.buildProgress += delta;

    if (this.state < 1 && this.buildProgress >= 1) {
      this.state = 1;
      (this.object.material as MeshBasicMaterial).map = TextureService.Instance.GetTexture('construction/bamboo/' + this.name + this.state);
    } else if (this.state < 2 && this.buildProgress >= 2) {
      this.state = 2;
      (this.object.material as MeshBasicMaterial).map = TextureService.Instance.GetTexture('construction/bamboo/' + this.name + this.state);
    } else if (this.state < 3 && this.buildProgress >= 3) {
      this.state = 3;
      (this.object.material as MeshBasicMaterial).map = TextureService.Instance.GetTexture('construction/bamboo/' + this.name + this.state);
    } else if (this.state < 4 && this.buildProgress >= 4) {
      this.state = 4;
      (this.object.material as MeshBasicMaterial).map = TextureService.Instance.GetTexture('construction/bamboo/' + this.name + this.state);
    }
  }

  IsBuild(): boolean {
    return this.state === 4;
  }

  Destroy() {
    this.object.clear();
  }
}

export { Stair };