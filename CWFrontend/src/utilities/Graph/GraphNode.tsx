import { Vector3 } from 'three';

export class GraphNode {
  position: Vector3;
	neighbors: GraphNode[];
	seen: boolean;
	previous: GraphNode | null;

  constructor(position: Vector3) {
		this.position = position;
		this.neighbors = [];
		this.seen = false;
		this.previous = null;
	}

	AddNeigbor(neigbor: GraphNode) {
		let add = true;

		this.neighbors.forEach(other => {
			if (other.Equals(neigbor))
				add = false;
		});

		if (add)
			this.neighbors.push(neigbor);
	}

	EqualsPosition(position: Vector3): boolean {
		return this.position.x === position.x && this.position.y === position.y;
	}

	Equals(other: GraphNode): boolean {
		return this.EqualsPosition(other.position);
	}

	Reset() {
		this.seen = false;
		this.previous = null;
	}
}