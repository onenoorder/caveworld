import { Vector3 } from 'three';
import { ITickableEntity, IWithTextureService } from 'entities';

export interface IBuilding extends ITickableEntity, IWithTextureService {
  name: string;
  door: number;
  buildProgress: number;

  GetDoorPosition(): Vector3;
  GetLeftCorner(): Vector3;
  GetRightCorner(): Vector3;
  Build(delta: number): void;
}