import { Vector3 } from 'three';
import { MapService } from '_services/index';
import { IDwarf } from '_dwarfs/index';
import { IBuilding } from '_buildings/index';
import { CompositeGoal, FollowPathGoal, ConstructScaffoldGoal } from '_goals/index';
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

    let from = this.dwarf.position.clone();
    from.x = Math.floor(from.x);
    from.y = Math.floor(from.y);
    from.z = 0;

    // The ladder of the scaffolding stands on the right side of the build:
    // one stair scaffold per row is placed in the rightmost column (x = width - 1).
    let leftCorner = this.building.GetLeftCorner();
    let ladderX = this.building.width - 1;

    // 1. Walk from wherever the dwarf stands to the left corner of the building.
    this.subGoals.Push(new FollowPathGoal(this.dwarf, MapService.Instance.paths.ShortestUnweightedPath(from, leftCorner)));

    // 2. Place the scaffolds of the ground row (y = 0) from left to right, walking to
    //    each cell first. The dwarf ends this row standing on the ladder column.
    for (let x = 0; x < this.building.width; x++) {
      let position: Vector3 = leftCorner.clone().add(new Vector3(x, 0, 0));
      this.subGoals.Push(new ConstructScaffoldGoal(this.dwarf, position, this.CalculateScaffoldNumber(x, 0), this.addScaffold));
      this.subGoals.Push(new FollowPathGoal(this.dwarf, this.CreateLeg(from, position)));
    }

    // 3. Place the rows above the ground row. For every row the dwarf walks to the
    //    ladder column on the right side of the build, climbs up one level with it,
    //    and then places that row from right to left while walking back.
    for (let y = 1; y < this.building.height; y++) {
      let ladderBase = leftCorner.clone().add(new Vector3(ladderX, y - 1, 0));
      let ladderTop = leftCorner.clone().add(new Vector3(ladderX, y, 0));

      // Walk to the foot of the ladder and climb up one level.
      this.subGoals.Push(new FollowPathGoal(this.dwarf, this.CreateLeg(from, ladderBase)));
      this.subGoals.Push(new FollowPathGoal(this.dwarf, this.CreateLeg(ladderBase, ladderTop)));

      // The ladder itself is one stair scaffold per row placed in the rightmost column.
      this.subGoals.Push(new ConstructScaffoldGoal(this.dwarf, ladderTop, this.CalculateScaffoldStairNumber(ladderX, y), this.addScaffold));

      // Place the remaining scaffolds of this row from right to left, walking to
      // each cell first, so the dwarf leaves the ladder and walks back over the row.
      for (let x = this.building.width - 1; x >= 0; x--) {
        let position: Vector3 = leftCorner.clone().add(new Vector3(x, y, 0));
        this.subGoals.Push(new ConstructScaffoldGoal(this.dwarf, position, this.CalculateScaffoldNumber(x, y), this.addScaffold));
        this.subGoals.Push(new FollowPathGoal(this.dwarf, this.CreateLeg(from, position)));
      }
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
