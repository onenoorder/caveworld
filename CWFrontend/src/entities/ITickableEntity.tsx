import { IEntity } from "entities";

export interface ITickableEntity extends IEntity {
  Tick(delta: number): any;
}