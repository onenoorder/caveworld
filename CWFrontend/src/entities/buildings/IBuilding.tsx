import { Vector3 } from 'three';
import { ITickableEntity, IWithTextureService } from 'entities';
import { IInventory } from './inventory/IInventory';

export interface IBuilding extends ITickableEntity, IWithTextureService {
  name: string;
  door: number;
  buildProgress: number;
  state: number;
  inventory: IInventory;

  GetDoorPosition(): Vector3;
  GetLeftCorner(): Vector3;
  GetRightCorner(): Vector3;
  Build(delta: number): void;
  IsBuild(): boolean;
}