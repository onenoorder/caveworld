import { Vector3 } from 'three';
import { MapService } from '_services/index';
import { IDwarf } from '_dwarfs/index';
import { IBuilding } from '_buildings/index';
import { CompositeGoal, FollowPathGoal, ConstructScaffoldGoal, IGoal } from '_goals/index';
import { IAddScaffold } from '_utilities/IAddScaffold';
import { GraphNode } from '_utilities/index';

export class ConstructScaffoldingGoal extends CompositeGoal {
  building: IBuilding;
  starting: boolean = true;
  addScaffold: IAddScaffold;

  constructor(dwarf: IDwarf, building: IBuilding, addScaffold: IAddScaffold) {
    super(dwarf, 'Idle');

    this.building = building;
    this.addScaffold = addScaffold;
  }

  Activate() {
    super.Activate();

    let currentPosition = this.dwarf.position.clone();
    currentPosition.x = Math.floor(currentPosition.x);
    currentPosition.y = Math.floor(currentPosition.y);
    currentPosition.z = 0;

    // The composite goal stack is LIFO: the sub goal pushed last runs first.
    // The steps are therefore collected in execution order first and pushed
    // in reverse below, so the dwarf starts at the bottom left of the build
    // and finishes at the top left.
    let steps: IGoal[] = [];

    // The ladder of the scaffolding stands on the right side of the build:
    // every floor gets exactly one stair scaffold in the rightmost column
    // (x = width - 1), including the top floor.
    let leftCorner = this.building.GetLeftCorner();
    let ladderX = this.building.width - 1;

    // 1. Walk from wherever the dwarf stands to the left corner of the building.
    steps.push(new FollowPathGoal(this.dwarf, MapService.Instance.paths.ShortestUnweightedPath(currentPosition, leftCorner)));
    currentPosition = leftCorner.clone();

    // 2. Place the scaffolds of the ground floor (y = 0) from left to right,
    //    walking to each cell first. The rightmost cell is the stair of the
    //    ground floor, so the dwarf ends this floor at the foot of the ladder.
    for (let x = 0; x < this.building.width; x++) {
      let cell = leftCorner.clone().add(new Vector3(x, 0, 0));
      steps.push(new FollowPathGoal(this.dwarf, this.CreateLeg(currentPosition, cell)));

      if (x === ladderX) {
        steps.push(new ConstructScaffoldGoal(this.dwarf, cell, this.CalculateScaffoldStairNumber(ladderX, 0), this.addScaffold));
      } else {
        steps.push(new ConstructScaffoldGoal(this.dwarf, cell, this.CalculateScaffoldNumber(x, 0), this.addScaffold));
      }

      currentPosition = cell;
    }

    // 3. Place the floors above the ground floor. For each floor the dwarf
    //    climbs the ladder stair on the right side of the build one level up,
    //    places the stair of the new floor, and then walks back over the
    //    floor placing the remaining scaffolds from right to left.
    for (let y = 1; y < this.building.height; y++) {
      let ladderBase = leftCorner.clone().add(new Vector3(ladderX, y - 1, 0));
      let ladderTop = leftCorner.clone().add(new Vector3(ladderX, y, 0));

      // Walk to the ladder (a no-op when already standing on it) and climb up one level.
      steps.push(new FollowPathGoal(this.dwarf, this.CreateLeg(currentPosition, ladderBase)));
      steps.push(new FollowPathGoal(this.dwarf, this.CreateLeg(ladderBase, ladderTop)));
      currentPosition = ladderTop;

      // The stair of this floor, standing in the rightmost column.
      steps.push(new ConstructScaffoldGoal(this.dwarf, ladderTop, this.CalculateScaffoldStairNumber(ladderX, y), this.addScaffold));

      // Place the remaining scaffolds of this floor from right to left,
      // walking to each cell first. The ladder cell is skipped because its
      // stair scaffold was just placed.
      for (let x = this.building.width - 1; x >= 0; x--) {
        if (x === ladderX)
          continue;

        let cell = leftCorner.clone().add(new Vector3(x, y, 0));
        steps.push(new FollowPathGoal(this.dwarf, this.CreateLeg(currentPosition, cell)));
        steps.push(new ConstructScaffoldGoal(this.dwarf, cell, this.CalculateScaffoldNumber(x, y), this.addScaffold));
        currentPosition = cell;
      }
    }

    // Push the steps in reverse so that the first step (walking to the left
    // corner of the build) executes first on the LIFO sub goal stack.
    for (let index = steps.length - 1; index >= 0; index--) {
      this.subGoals.Push(steps[index]);
    }

    this.completed = false;
  }

  /**
   * Builds a small two node path (from -> to) that FollowPathGoal can translate
   * into walk, turn and climb steps without requiring a graph.
   */
  CreateLeg(from: Vector3, to: Vector3): GraphNode[] {
    return [new GraphNode(from.clone()), new GraphNode(to.clone())];
  }

  CalculateScaffoldNumber(x: number, y: number) {
    let scaffoldNumber;

    if (y % 2 === 0)
      scaffoldNumber = x % 2 === 0 ? 7 : 6;
    else
      scaffoldNumber = x % 2 === 0 ? 6 : 7;

    return scaffoldNumber;
  }

  CalculateScaffoldStairNumber(x: number, y: number) {
    return x % 2 === 0 ? 8 : 9;
  }

  Run(delta: number): Vector3 {
    let returnValue = super.Run(delta);

    return returnValue;
  }
}
