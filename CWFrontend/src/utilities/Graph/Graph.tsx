import { Vector3 } from 'three';
import { Queue } from '_utilities/index';
import { IGraph, GraphNode } from '.';

export class Graph implements IGraph {
	nodeSet: Map<Vector3, GraphNode>;

  constructor() {
		this.nodeSet = new Map<Vector3, GraphNode>();
	}

	HasPosition(position: Vector3): boolean {
		let found = false;

		this.nodeSet.forEach((value, key) => {
			if (key.x === position.x && key.y === position.y) {
				found = true;
				return;
			}
		});

		return found;
	}

	Get(position: Vector3): GraphNode | undefined {
		let found = undefined;

		this.nodeSet.forEach((value, key) => {
			if (key.x === position.x && key.y === position.y) {
				found = value;
				return;
			}
		});

		return found;
	}

	AddNode(node: GraphNode) {
		this.nodeSet.set(node.position, node);
	}

	FindAndAddNeighbor(node: GraphNode, position: Vector3) {
		if (this.HasPosition(position)) {
			let neighbor = this.Get(position) as GraphNode;
			neighbor.AddNeigbor(node);
			node.AddNeigbor(neighbor);
		}
	}

  AddPosition(position: Vector3) {
		if (!this.HasPosition(position)) {
			let node = new GraphNode(position);
			this.AddNode(node);

			this.FindAndAddNeighbor(node, position.clone().add(new Vector3(0, 1, 0)));
			this.FindAndAddNeighbor(node, position.clone().add(new Vector3(1, 0, 0)));
			this.FindAndAddNeighbor(node, position.clone().add(new Vector3(0, -1, 0)));
			this.FindAndAddNeighbor(node, position.clone().add(new Vector3(-1, 0, 0)));
		}
	}

	MakePath(from: GraphNode, to: GraphNode): GraphNode[] {
		let returnValue: GraphNode[] = [];
		if (to.previous !== null) {
			let current = to;
			while (true) {
				returnValue.push(current);
				if (!current.Equals(from)) {
					current = current.previous as GraphNode;
				} else {
					break;
				}
			}
		}
		return this.PathSmoothing(returnValue.reverse());
	}

	IsStraight(from: GraphNode, to: GraphNode) {
		return from.position.x === to.position.x || from.position.y === to.position.y;
	}

	PathSmoothing(path: GraphNode[]): GraphNode[] {
		let counter = 0;
		
		while (counter < path.length - 2) {
			if (this.IsStraight(path[counter], path[counter + 2])) {
				path.splice(counter + 1, 1);
			} else {
				counter++;
			}
		}

		return path;
	}

	ShortestUnweightedPath(from: Vector3, to: Vector3): GraphNode[] {
		if (!this.HasPosition(from) || !this.HasPosition(to))
			return [];

		this.nodeSet.forEach(node => node.Reset());

		let start = this.Get(from) as GraphNode;
		let end = this.Get(to) as GraphNode;

		if (start.Equals(end)) {
			let path = [start];
			return path;
		}

		let queue = new Queue<GraphNode>();
		queue.Enqueue(start);
		start.seen = true;

		while(queue.Size() !== 0) {
			let current = queue.Dequeue() as GraphNode;
			current.neighbors.forEach(neighbor => {
				if (!neighbor.seen) {
					neighbor.previous = current;
					neighbor.seen = true;
					queue.Enqueue(neighbor);
					if (neighbor.Equals(end)) {
						return;
					}
				}
			});
		}

		return this.MakePath(start, end);
	}
}