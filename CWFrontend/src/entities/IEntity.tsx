import { Vector3, Mesh } from 'three';

export interface IEntity {
  position: Vector3;
  object: Mesh;
  height: number;
  width: number;

  BuildObject(): Mesh;
  Destroy(): void;
}