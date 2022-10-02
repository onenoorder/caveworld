import { BufferGeometry, Material, Mesh, MeshBasicMaterial, PlaneGeometry, Vector3 } from 'three';
import { TextureService } from '_services/index';
import { IWithTextureService } from '_entities/index';
import { IStack, Stack } from '_utilities/Stack';

class Scaffold implements IWithTextureService {
	position: Vector3;
	object: Mesh<BufferGeometry, Material | Material[]>;
  state: number = 0;
  buildProgress: number = 0;
  name: string = 'construction/Scaffold';
  endNumber: number;
  numbers: IStack<number>;

	constructor(position: Vector3, endNumber: number) {
    this.position = position;
    this.position.z = 0.00001;
    this.endNumber = endNumber;
    this.numbers = new Stack<number>();

    if (this.endNumber === 6 || this.endNumber === 7) {
      this.numbers.Push(0);
      this.numbers.Push(1);
      this.numbers.Push(2);
      this.numbers.Push(3);
      if (this.endNumber === 6) {
        this.numbers.Push(4);
      } else if (this.endNumber === 7) {
        this.numbers.Push(5);
      }
    }
    this.numbers.Push(endNumber);

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
      map: TextureService.Instance.GetTexture(this.name + this.state), 
      depthTest: false,
      transparent: true
    });
  }

  Build(delta: number) {
    this.buildProgress += delta;

    if (!this.IsBuild()) {
      this.state = this.numbers.Pop() || 0;
      (this.object.material as MeshBasicMaterial).map = TextureService.Instance.GetTexture(this.name + this.state);
    }
  }

  IsBuild(): boolean {
    return this.numbers.Size() === 0;
  }

  Destroy() {
    this.object.clear();
  }
}

export { Scaffold };