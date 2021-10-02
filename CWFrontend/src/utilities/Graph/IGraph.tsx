import { Vector3 } from 'three';
import { GraphNode } from '.';

export interface IGraph {
  AddNode(node: GraphNode): void;
  AddPosition(position: Vector3): void;
  ShortestUnweightedPath(from: Vector3, to: Vector3): GraphNode[];
}