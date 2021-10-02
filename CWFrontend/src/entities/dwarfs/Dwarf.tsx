import { BufferGeometry, Material, Mesh, MeshBasicMaterial, PlaneGeometry, Vector3 } from 'three';
import { IHouse } from '_entities/buildings/houses/index';
import { TextureService } from '_services/index';
import { IDwarf } from '.';
import { IGoal, LifeGoal } from '_goals/index';
import { IJob } from '_jobs/index';

class Dwarf implements IDwarf {
	position: Vector3;
	object: Mesh<BufferGeometry, Material | Material[]>;
	height: number;
	width: number;
  velocity: Vector3;
  velocityCalculate: Vector3;
	home: IHouse | null;
  speed: Vector3;
	maxSpeed: Vector3;
	direction: Vector3;
	kind: string;
  rotation: number;
  goal: IGoal;
	job: IJob | null;

	constructor(position: Vector3, home: IHouse | null, kind: string) {
    this.position = position;
    this.position.z = 0.00001;
    this.height = 1;
    this.width = 1;
    this.home = home;
		this.kind = kind;
		this.velocity = new Vector3(0, 0, 0);
		this.velocityCalculate = new Vector3(0, 0, 0);
		this.speed = new Vector3(0.2, 0.1, 0.01);
		this.maxSpeed = new Vector3(0.5, 0.2, 0.01);
		this.direction = new Vector3(0, 0, 0);
    this.object = new Mesh();
    this.rotation = 0;

    this.goal = new LifeGoal(this);
    this.job = null;
  }

	BuildObject() {
    const geometry = new PlaneGeometry(this.width, this.height);
    this.object = new Mesh(geometry, this.CreateMaterial());
    this.object.renderOrder = 999;
    this.object.position.x += this.position.x + (this.width / 2);
    this.object.position.y += this.position.y + (this.height / 2);
    return this.object;
  }

  CreateMaterial(): Material {
    return new MeshBasicMaterial({ 
      map: TextureService.Instance.GetDwarfTexture(this.kind, this.goal.GetName(), this.goal.GetState()), 
      depthTest: false,
      transparent: true
    });
  }

  UpdateNeeds(delta: number) {
    
  }

  Tick(delta: number) {
    this.velocityCalculate = new Vector3(0, 0, 0);
    let acceleration = this.goal.Run(delta);

    this.UpdateNeeds(delta);

    this.velocity.add(acceleration);
    this.position.add(this.velocity.clone().multiply(this.direction).multiply(new Vector3(delta, delta, delta)));

    this.object.position.x = this.position.x + 0.5;
    this.object.position.y = this.position.y + 0.5;
    this.object.position.z = this.position.z;
    (this.object.material as MeshBasicMaterial).map = TextureService.Instance.GetDwarfTexture(this.kind, this.goal.GetName(), this.goal.GetState());
  }

  Destroy() {
    this.object.clear();
  }
}

export { Dwarf };