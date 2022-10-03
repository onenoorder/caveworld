import { BufferGeometry, Material, Mesh, MeshBasicMaterial, PlaneGeometry, Vector3 } from 'three';
import { TextureService } from '_services/index';
import { IWithTextureService } from '_entities/index';
import { IQueue, Queue } from '_utilities/Queue';

class Scaffold implements IWithTextureService {
	position: Vector3;
	object: Mesh<BufferGeometry, Material | Material[]>;
  state: number = 0;
  buildProgress: number = 0;
  endNumber: number;
  numbers: IQueue<number>;

	constructor(position: Vector3, endNumber: number) {
    this.position = position;
    this.position.z = 0.00001;
    this.endNumber = endNumber;
    this.numbers = new Queue<number>();

    if (this.endNumber === 6 || this.endNumber === 7) {
      this.numbers.Enqueue(0);
      this.numbers.Enqueue(1);
      this.numbers.Enqueue(2);
      this.numbers.Enqueue(3);
      if (this.endNumber === 6) {
        this.numbers.Enqueue(4);
      } else if (this.endNumber === 7) {
        this.numbers.Enqueue(5);
      }
    }
    this.numbers.Enqueue(endNumber);

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

    if (!this.IsBuild()) {
      this.state = this.numbers.Dequeue() || 0;
      (this.object.material as MeshBasicMaterial).map = TextureService.Instance.GetScaffoldTexture(this.state);
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