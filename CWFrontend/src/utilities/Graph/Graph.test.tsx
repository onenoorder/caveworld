import { Vector3 } from 'three';
import { Graph, GraphNode } from '_utilities/Graph/index';

describe('Graph (CAV-003 coverage gate, tier 1: utilities)', () => {
  describe('AddPosition / neighbor wiring', () => {
    it('adds a node for a new position and links it bidirectionally to adjacent existing nodes', () => {
      // Arrange
      const graph = new Graph();

      // Act
      graph.AddPosition(new Vector3(0, 0, 0));
      graph.AddPosition(new Vector3(1, 0, 0));

      // Assert — the second AddPosition probes four neighbors; only (0,0)
      // exists, so exactly one bidirectional link is created.
      const first = graph.Get(new Vector3(0, 0, 0)) as GraphNode;
      const second = graph.Get(new Vector3(1, 0, 0)) as GraphNode;
      expect(graph.nodeSet.size).toBe(2);
      expect(first.neighbors).toHaveLength(1);
      expect(first.neighbors[0]).toBe(second);
      expect(second.neighbors).toHaveLength(1);
      expect(second.neighbors[0]).toBe(first);
    });

    it('is a no-op when the position already exists in the graph', () => {
      // Arrange
      const graph = new Graph();
      graph.AddPosition(new Vector3(0, 0, 0));

      // Act
      graph.AddPosition(new Vector3(0, 0, 0));

      // Assert — still exactly one node; no duplicate or self-wiring happened.
      expect(graph.nodeSet.size).toBe(1);
    });
  });

  describe('HasPosition / Get position matching', () => {
    it('matches positions by x and y and ignores z', () => {
      // Arrange
      const graph = new Graph();
      graph.AddPosition(new Vector3(0, 0, 0));

      // Act + Assert
      expect(graph.HasPosition(new Vector3(0, 0, 7))).toBe(true);
      expect(graph.Get(new Vector3(0, 0, 7))).toBe(graph.Get(new Vector3(0, 0, 0)));
    });

    it('does not match when x or y differ', () => {
      // Arrange
      const graph = new Graph();
      graph.AddPosition(new Vector3(0, 0, 0));

      // Act + Assert
      expect(graph.HasPosition(new Vector3(1, 0, 0))).toBe(false);
      expect(graph.HasPosition(new Vector3(0, 1, 0))).toBe(false);
      expect(graph.Get(new Vector3(5, 5, 0))).toBeUndefined();
    });
  });

  describe('ShortestUnweightedPath', () => {
    it('returns the BFS path with collinear waypoints smoothed out', () => {
      // Arrange — an L-shape: (0,0) → (1,0) → (2,0) → (2,1).
      const graph = new Graph();
      graph.AddPosition(new Vector3(0, 0, 0));
      graph.AddPosition(new Vector3(1, 0, 0));
      graph.AddPosition(new Vector3(2, 0, 0));
      graph.AddPosition(new Vector3(2, 1, 0));

      // Act
      const path = graph.ShortestUnweightedPath(new Vector3(0, 0, 0), new Vector3(2, 1, 0));

      // Assert — the middle waypoint of the straight run, (1,0), is smoothed
      // away; only the corner (2,0) and the target remain after (0,0).
      expect(path.map((node) => node.position.x + ',' + node.position.y)).toEqual(['0,0', '2,0', '2,1']);
    });

    it('returns only the start node when from and to are the same position', () => {
      // Arrange
      const graph = new Graph();
      graph.AddPosition(new Vector3(0, 0, 0));

      // Act
      const path = graph.ShortestUnweightedPath(new Vector3(0, 0, 0), new Vector3(0, 0, 0));

      // Assert
      expect(path).toHaveLength(1);
      expect(path[0].EqualsPosition(new Vector3(0, 0, 0))).toBe(true);
    });

    it('returns an empty path when either endpoint is not in the graph', () => {
      // Arrange — one node exists; both directions of a missing endpoint.
      const graph = new Graph();
      graph.AddPosition(new Vector3(0, 0, 0));

      // Act + Assert
      expect(graph.ShortestUnweightedPath(new Vector3(9, 9, 0), new Vector3(0, 0, 0))).toEqual([]);
      expect(graph.ShortestUnweightedPath(new Vector3(0, 0, 0), new Vector3(9, 9, 0))).toEqual([]);
    });

    it('returns an empty path when the target is unreachable (disconnected components)', () => {
      // Arrange — (0,0) is isolated from the (5,5)/(6,5) pair.
      const graph = new Graph();
      graph.AddPosition(new Vector3(0, 0, 0));
      graph.AddPosition(new Vector3(5, 5, 0));
      graph.AddPosition(new Vector3(6, 5, 0));

      // Act
      const path = graph.ShortestUnweightedPath(new Vector3(0, 0, 0), new Vector3(6, 5, 0));

      // Assert — BFS exhausts the queue without ever reaching the target, so
      // the target keeps previous === null and MakePath yields [].
      expect(path).toEqual([]);
    });
  });

  describe('GraphNode', () => {
    it('AddNeigbor ignores a duplicate neighbor', () => {
      // Arrange
      const node = new GraphNode(new Vector3(0, 0, 0));
      const neighbor = new GraphNode(new Vector3(1, 0, 0));
      node.AddNeigbor(neighbor);

      // Act
      node.AddNeigbor(neighbor);

      // Assert
      expect(node.neighbors).toHaveLength(1);
    });

    it('Equals compares by x/y position and ignores z', () => {
      // Arrange
      const node = new GraphNode(new Vector3(0, 0, 0));
      const sameCell = new GraphNode(new Vector3(0, 0, 9));
      const otherCell = new GraphNode(new Vector3(3, 3, 0));

      // Act + Assert
      expect(node.Equals(sameCell)).toBe(true);
      expect(node.Equals(otherCell)).toBe(false);
      expect(node.EqualsPosition(new Vector3(0, 0, 5))).toBe(true);
      expect(node.EqualsPosition(new Vector3(1, 0, 0))).toBe(false);
    });

    it('Reset clears seen/previous but keeps neighbors', () => {
      // Arrange
      const node = new GraphNode(new Vector3(0, 0, 0));
      const neighbor = new GraphNode(new Vector3(1, 0, 0));
      node.AddNeigbor(neighbor);
      node.seen = true;
      node.previous = neighbor;

      // Act
      node.Reset();

      // Assert
      expect(node.seen).toBe(false);
      expect(node.previous).toBeNull();
      expect(node.neighbors).toContain(neighbor);
    });
  });
});
