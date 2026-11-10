import { Vector3 } from 'three';
import { PlantingGoal, FollowPathGoal } from '_goals/index';
import { Bamboo } from '_buildings/index';
import { MapService, EntityService, TextureService } from '_services/index';

// CAV-004 J2/J3 (test design 0f67245b): arrival completes the planting —
// plant.Plant() fires exactly once when the dwarf stands on the target cell;
// drained-but-not-arrived re-paths instead (ConstructBuildingGoal parity).

function setupMapDouble(shortest: any[] = []) {
  const fakeTexture = { dispose: jest.fn() } as any;
  (TextureService as any).Instance = {
    Destroy: jest.fn(),
    GetTexture: jest.fn(() => fakeTexture),
    GetBuildingTexture: jest.fn(() => fakeTexture),
    GetBuildingTextureWithState: jest.fn(() => fakeTexture),
  };
  (EntityService as any).Instance = {
    GetSeedCells: jest.fn(() => []),
    EnqueueSeed: jest.fn(),
  } as any;
  (MapService as any).Instance = {
    paths: { ShortestUnweightedPath: jest.fn(() => shortest) },
  } as any;
}

function makeDwarf(x: number, y: number) {
  return { position: new Vector3(x, y, 0) } as any;
}

describe('PlantingGoal (CAV-004 J2/J3)', () => {
  beforeEach(() => setupMapDouble());

  it('J2: plants exactly once when the walk completes with the dwarf on the target cell, then completes the goal', () => {
    // Arrange — plant at (4,2) 1x2 -> GetRightCorner() = (4,2). Dwarf already
    // on the target: FollowPathGoal.Activate sees path end == dwarf position
    // and completes instantly, draining the subgoal stack.
    const plant = new Bamboo(new Vector3(4, 2, 0));
    const plantSpy = jest.spyOn(plant, 'Plant');
    const goal = new PlantingGoal(makeDwarf(4, 2), plant);

    // Act — first Run activates + drains the subgoal; second Run sees
    // completed && on-target and plants.
    goal.Run(0.016);
    goal.Run(0.016);

    // Assert
    expect(plantSpy).toHaveBeenCalledTimes(1);
    expect(plant.planted).toBe(true);
    expect(goal.completed).toBe(true);
  });

  it('J2 (variant): a plant not on the arrival cell does not plant — the goal targets GetRightCorner()', () => {
    // Arrange — dwarf at (0,2) walking toward (4,2); path has length so the
    // subgoal stack is not instantly drained.
    const plant = new Bamboo(new Vector3(4, 2, 0));
    const plantSpy = jest.spyOn(plant, 'Plant');
    const node = (x: number, y: number) => ({ position: new Vector3(x, y, 0), EqualsPosition: (p: any) => p.x === x && p.y === y });
    (MapService as any).Instance.paths.ShortestUnweightedPath = jest.fn(() => [node(0, 2), node(4, 2)]);
    const dwarf = makeDwarf(0, 2);
    const goal = new PlantingGoal(dwarf, plant);
    goal.Run(0.016);

    // Act — walk not finished: subgoals still on the stack.
    goal.Run(0.016);

    // Assert
    expect(plantSpy).not.toHaveBeenCalled();
    expect(goal.completed).toBe(false);
  });

  it('J3: drained but not on target re-activates (re-path) and still does not plant', () => {
    // Arrange — empty path: FollowPathGoal activates and completes instantly
    // (no subgoals pushed), but the dwarf never reaches the target cell.
    const plant = new Bamboo(new Vector3(4, 2, 0));
    const plantSpy = jest.spyOn(plant, 'Plant');
    const goal = new PlantingGoal(makeDwarf(0, 2), plant);

    // Act — Run twice: drain + re-path attempt.
    goal.Run(0.016);
    expect(plantSpy).not.toHaveBeenCalled();
    goal.Run(0.016);

    // Assert — re-Activate consulted the path service again; no planting.
    expect((MapService as any).Instance.paths.ShortestUnweightedPath).toHaveBeenCalled();
    expect(plantSpy).not.toHaveBeenCalled();
  });

  it('J2 (J4 parity): once planted, the goal reports completed so the task and 1-task job finish', () => {
    // Arrange
    const plant = new Bamboo(new Vector3(4, 2, 0));
    const goal = new PlantingGoal(makeDwarf(4, 2), plant);

    // Act
    goal.Run(0.016);
    goal.Run(0.016);

    // Assert — completed goal: task.Work's goal.completed is true; the job's
    // task stack is already empty -> JobService.Find sweeps it (documented
    // benign parity with existing construction jobs).
    expect(goal.completed).toBe(true);
  });
});
