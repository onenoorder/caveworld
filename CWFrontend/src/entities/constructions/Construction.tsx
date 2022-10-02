import { BufferGeometry, Material, Mesh, MeshBasicMaterial, PlaneGeometry, Vector3 } from 'three';
import { TextureService } from '_services/index';
import { IJob } from '_jobs/index';
import { IConstruction } from './IConstruction';
import { ConstructionType, Direction } from '_utilities/Enums';
import { JobService } from '_services/index';

abstract class Construction implements IConstruction {
	position: Vector3;
	object: Mesh<BufferGeometry, Material | Material[]>;
	height: number;
	width: number;
  direction: Direction;
  constructionType: ConstructionType;
  state: number = 0;
  lastAction: number = 0;
  name: string = 'Flag';
  job: IJob;

	constructor(position: Vector3, height: number, width: number, direction: Direction, constructionType: ConstructionType, job: IJob) {
    this.position = position;
    this.position.z = 0.00001;
    this.height = height;
    this.width = width;
    this.direction = direction;
    this.constructionType = constructionType;
    this.job = job;
    this.object = new Mesh();

    JobService.Instance.AddJob(this.job);
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

  Tick(delta: number) {
    this.lastAction += delta;

    if (this.lastAction > 0.2) {
      this.state++;

      this.lastAction = 0;
      if (this.state > 2) {
        this.state = 0;
      }
      (this.object.material as MeshBasicMaterial).map = TextureService.Instance.GetTexture(this.name + this.state);
    }
  }

  IsCompleted(): boolean {
    return this.job.IsCompleted();
  }

  Destroy() {
    this.object.clear();
  }
}

export { Construction };