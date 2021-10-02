import { Vector3 } from 'three';
import { ITickableEntity, IWithTextureService } from 'entities';
import { IHouse } from 'entities/buildings/houses';
import { IGoal } from '_goals/index';
import { IJob } from '_jobs/index';

export interface IDwarf extends ITickableEntity, IWithTextureService {
  velocity: Vector3;
  velocityCalculate: Vector3;
	home: IHouse | null;
	kind: string;
	speed: Vector3;
	maxSpeed: Vector3;
	direction: Vector3;
	rotation: number;
	goal: IGoal;
	job: IJob | null;
}