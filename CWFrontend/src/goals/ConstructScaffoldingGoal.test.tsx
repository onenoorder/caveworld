import { Texture, Vector3 } from 'three';
import { ConstructScaffoldingGoal, FollowPathGoal } from '_goals/index';
import { ConstructScaffoldGoal } from '_goals/ConstructScaffoldGoal';
import { MapService, EntityService, TextureService } from '_services/index';
import { IAddScaffold } from '_utilities/IAddScaffold';
import { GraphNode } from '_utilities/index';
import { Scaffold } from '_entities/Scaffold';
import { IDwarf } from '_entities/dwarfs/index';
import { IBuilding } from '_buildings/index';
import { DwarfKind } from '_utilities/Enums';

describe('ConstructScaffoldingGoal', () => {
  beforeEach(() => {
    // The dwarf pathing graph is scene/renderer backed; a simple two node
    // path (start -> target) is enough for the initial walk.
    MapService.Instance = {
      paths: {
        ShortestUnweightedPath: (from: Vector3, to: Vector3) => [new GraphNode(from.clone()), new GraphNode(to.clone())],
      },
    } as unknown as MapService;

    // ConstructScaffoldGoal hands built scaffolds to EntityService; the unit
    // test records them instead of touching the Three.js scene.
    EntityService.Instance = {
      AddScaffold: (scaffold: Scaffold) => {
        placedScaffolds.push(scaffold);
      },
    } as unknown as EntityService;

    // Scaffold.Build refreshes its texture on every build step; textures are
    // loaded by the renderer, so a plain Three.js texture is handed out instead.
    TextureService.Instance = {
      GetScaffoldTexture: (_number: number) => new Texture(),
    } as unknown as TextureService;
  });

  let placedScaffolds: Scaffold[];

  /**
   * Creates a minimal dwarf double holding only the fields the goal tree reads.
   */
  function CreateDwarf(position: Vector3): IDwarf {
    return {
      position,
      object: null,
      height: 1,
      width: 1,
      velocity: new Vector3(0, 0, 0),
      velocityCalculate: new Vector3(0, 0, 0),
      home: null,
      kind: DwarfKind.BLUE,
      speed: new Vector3(0.2, 0.1, 0.01),
      maxSpeed: new Vector3(0.5, 0.2, 0.01),
      direction: new Vector3(0, 0, 0),
      rotation: 0,
      goal: null,
      job: null,
      BuildObject: () => null,
      CreateMaterial: () => null,
      Tick: (_delta: number) => null,
      UpdateTexture: () => null,
      Destroy: () => null,
    } as unknown as IDwarf;
  }

  /**
   * Creates a building double exposing the geometry the goal reads.
   */
  function CreateBuilding(leftCorner: Vector3, width: number, height: number): IBuilding {
    return {
      name: 'House',
      door: 0,
      buildProgress: 0,
      position: leftCorner,
      height,
      width,
      object: null,
      BuildObject: () => null,
      CreateMaterial: () => null,
      Tick: (_delta: number) => null,
      Build: (_delta: number) => null,
      IsBuild: () => true,
      GetDoorPosition: () => leftCorner.clone(),
      GetLeftCorner: () => leftCorner.clone(),
      GetRightCorner: () => leftCorner.clone().add(new Vector3(width - 1, 0, 0)),
    } as unknown as IBuilding;
  }

  function CreateAddScaffold(): IAddScaffold {
    return { AddScaffold: (_scaffold: Scaffold) => undefined };
  }

  /**
   * Runs the goal tree tick by tick until it completes, mirroring the movement
   * integration of Dwarf.Tick (velocity += acceleration; position += velocity
   * * direction * delta) so walking, turning and climbing can actually advance
   * the dwarf and the sub goals can complete.
   */
  function RunUntilCompleted(goal: ConstructScaffoldingGoal, delta: number = 0.35, maxTicks: number = 5000): void {
    for (let tick = 0; tick < maxTicks; tick++) {
      let acceleration = goal.Run(delta);
      goal.dwarf.velocity.add(acceleration);
      goal.dwarf.position.add(goal.dwarf.velocity.clone().multiply(goal.dwarf.direction).multiply(new Vector3(delta, delta, delta)));

      if (goal.completed) {
        return;
      }
    }

    throw new Error('ConstructScaffoldingGoal did not complete within the tick budget');
  }

  /**
   * Drains the LIFO sub goal stack and flattens it into execution order:
   * the goal pushed last (peeked first) runs first.
   */
  function DrainSubGoals(goal: ConstructScaffoldingGoal): { constructGoals: ConstructScaffoldGoal[]; legGoals: FollowPathGoal[] } {
    let constructGoals: ConstructScaffoldGoal[] = [];
    let legGoals: FollowPathGoal[] = [];

    while (goal.subGoals.Size() > 0) {
      let subGoal = goal.subGoals.Peek();
      goal.subGoals.Pop();

      if (subGoal instanceof ConstructScaffoldGoal) {
        constructGoals.push(subGoal);
      } else if (subGoal instanceof FollowPathGoal) {
        legGoals.push(subGoal);
      }
    }

    return { constructGoals, legGoals };
  }

  it('starts at the bottom left and finishes at the top left of the build', () => {
    // Arrange
    placedScaffolds = [];
    let dwarf = CreateDwarf(new Vector3(20, 5, 0));
    let building = CreateBuilding(new Vector3(10, 10, 0), 4, 3);
    let goal = new ConstructScaffoldingGoal(dwarf, building, CreateAddScaffold());
    goal.Activate();

    // Act
    let { constructGoals } = DrainSubGoals(goal);

    // Assert — execution order is the drain order of the LIFO stack.
    let first = constructGoals[0];
    let last = constructGoals[constructGoals.length - 1];
    expect(first.target.x).toBe(10);
    expect(first.target.y).toBe(10);
    expect(last.target.x).toBe(10);
    expect(last.target.y).toBe(12);
  });

  it('drives the first walk to the left corner of the building before any scaffold is placed', () => {
    // Arrange
    placedScaffolds = [];
    let dwarf = CreateDwarf(new Vector3(20, 5, 0));
    let building = CreateBuilding(new Vector3(10, 10, 0), 4, 3);
    let goal = new ConstructScaffoldingGoal(dwarf, building, CreateAddScaffold());
    goal.Activate();

    // Act
    let { constructGoals, legGoals } = DrainSubGoals(goal);

    // Assert — the drain order is the execution order, so the first drained
    // leg runs first and must end at the left corner of the building.
    let firstLeg = legGoals[0];
    let firstLegTarget = firstLeg.path[firstLeg.path.length - 1].position;
    expect(firstLegTarget.x).toBe(10);
    expect(firstLegTarget.y).toBe(10);

    // The second leg runs second and must lead to the first scaffold cell,
    // which is the bottom left cell of the build.
    let secondLeg = legGoals[1];
    let secondLegTarget = secondLeg.path[secondLeg.path.length - 1].position;
    expect(secondLegTarget.x).toBe(10);
    expect(secondLegTarget.y).toBe(10);

    expect(constructGoals[0].target.x).toBe(10);
    expect(constructGoals[0].target.y).toBe(10);
  });

  it('places exactly one stair scaffold per floor in the rightmost column, including the top floor', () => {
    // Arrange
    placedScaffolds = [];
    let dwarf = CreateDwarf(new Vector3(20, 5, 0));
    let building = CreateBuilding(new Vector3(10, 10, 0), 4, 3);
    let goal = new ConstructScaffoldingGoal(dwarf, building, CreateAddScaffold());
    goal.Activate();

    // Act
    let { constructGoals } = DrainSubGoals(goal);

    // Assert — every floor has exactly one stair scaffold and no other scaffold
    // occupies the ladder column, so the ladder is complete up to the top floor.
    let ladderX = 10 + 4 - 1;
    for (let y = 10; y < 10 + 3; y++) {
      let scaffoldsOnFloor = constructGoals.filter(goal => goal.target.y === y);
      let ladderScaffolds = scaffoldsOnFloor.filter(goal => goal.target.x === ladderX);
      let stairScaffolds = ladderScaffolds.filter(goal => goal.scaffold.endNumber === 8 || goal.scaffold.endNumber === 9);

      expect(scaffoldsOnFloor.length).toBe(4);
      expect(ladderScaffolds.length).toBe(1);
      expect(stairScaffolds.length).toBe(1);
    }

    // The top floor (y = 12) must carry the stair too.
    let topFloorScaffolds = constructGoals.filter(goal => goal.target.y === 12);
    let topFloorStairs = topFloorScaffolds.filter(goal => goal.scaffold.endNumber === 8 || goal.scaffold.endNumber === 9);
    expect(topFloorStairs.length).toBe(1);
  });

  it('completes and registers every scaffold with EntityService when run tick by tick', () => {
    // Arrange
    placedScaffolds = [];
    let dwarf = CreateDwarf(new Vector3(20, 5, 0));
    let building = CreateBuilding(new Vector3(10, 10, 0), 4, 3);
    let goal = new ConstructScaffoldingGoal(dwarf, building, CreateAddScaffold());

    // Act
    RunUntilCompleted(goal, 0.35, 5000);

    // Assert
    expect(goal.completed).toBe(true);
    expect(placedScaffolds.length).toBe(4 * 3);
  });
});
