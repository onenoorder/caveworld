import { Vector3 } from 'three';
import { Bamboo, Tree } from '_buildings/index';
import { GROWTH_FRAME_SECONDS, SEED_ROLL_SECONDS } from '_buildings/index';
import { EntityService, MapService, TextureService } from '_services/index';

// CAV-004 G1–G5, S1–S6 (test design 0f67245b): plant lifecycle, growth
// timing, and seeding — deterministic via injected delta (architecture D4)
// and an injectable seed-cell source (test design S6). No timer mocks.

function setupTextureDouble() {
  const fakeTexture = { dispose: jest.fn() } as any;
  const calls: { name: string, state: number, stateCount: number }[] = [];
  (TextureService as any).Instance = {
    Destroy: jest.fn(),
    GetTexture: jest.fn(() => fakeTexture),
    GetBuildingTexture: jest.fn(() => fakeTexture),
    GetBuildingTextureWithState: jest.fn((name: string, state: number, stateCount: number) => {
      calls.push({ name, state, stateCount });
      return fakeTexture;
    }),
  };
  return { fakeTexture, calls };
}

// A tiny concrete plant with frameCount = 5: total growing time = 4*60 = 240s,
// seeding window opens at 120s (test design §3 fixtures).
const TEST_FRAMES = 5;
const SEED_WINDOW = ((TEST_FRAMES - 1) * GROWTH_FRAME_SECONDS) / 2; // 120

function makePlant(seedCellSource?: () => Vector3 | null) {
  return new Bamboo(new Vector3(10, 10, 0), seedCellSource);
}

describe('Plant lifecycle and growth timing (CAV-004 G1–G5)', () => {
  beforeEach(() => {
    setupTextureDouble();
    (EntityService as any).Instance = {
      GetSeedCells: jest.fn(() => []),
      EnqueueSeed: jest.fn(),
    } as any;
    (MapService as any).Instance = { CanPlace: jest.fn(() => false) } as any;
  });

  it('G1: a pending plant does not grow — Tick before Plant() keeps frame 0, requests no texture, reports not built', () => {
    // Arrange
    const { calls } = setupTextureDouble();
    (EntityService as any).Instance = { GetSeedCells: jest.fn(() => []), EnqueueSeed: jest.fn() } as any;
    const plant = makePlant();

    // Act
    plant.Tick(300);

    // Assert — BuildObject has not run either, so no growth texture swap.
    expect(plant.frame).toBe(0);
    expect(plant.planted).toBe(false);
    expect(plant.IsBuild()).toBe(false);
    expect(calls.filter(c => c.name === 'Bamboo')).toHaveLength(0);
  });

  it('G2: Plant() makes the mesh visible at frame 0 and starts the clock — 59s stays frame 0, reaching 60s advances to frame 1', () => {
    // Arrange
    const plant = makePlant();
    plant.BuildObject();

    // Act
    plant.Plant();
    plant.Tick(59);

    // Assert
    expect(plant.planted).toBe(true);
    expect(plant.object.visible).toBe(true);
    expect(plant.frame).toBe(0);
    expect(plant.IsBuild()).toBe(true);

    // Act — cross the boundary with cumulative ticks (floor semantics).
    plant.Tick(1);

    // Assert
    expect(plant.frame).toBe(1);
  });

  it('G3: growth caps at the mature frame (N-1) and stays there far beyond the total growing time', () => {
    // Arrange
    const plant = makePlant();
    plant.BuildObject();
    plant.Plant();

    // Act — far beyond (N-1)*60 = 2280s for the measured Bamboo N=39.
    plant.Tick((39 - 1) * 60 + 100000);

    // Assert
    expect(plant.frame).toBe(38);
  });

  it('G4: dirty check — two Ticks inside the same frame request the growth texture at most once', () => {
    // Arrange
    const { calls } = setupTextureDouble();
    (EntityService as any).Instance = { GetSeedCells: jest.fn(() => []), EnqueueSeed: jest.fn() } as any;
    const plant = makePlant();
    plant.BuildObject();
    plant.Plant();

    // Act — 10 + 10 + 10: all within frame 0 (< 60s).
    plant.Tick(10);
    plant.Tick(10);
    plant.Tick(10);

    // Assert — only the frame-0 swap (from Plant-time material creation is
    // separate; growth swaps only fire on frame change).
    const growthSwaps = calls.filter(c => c.name === 'Bamboo' && c.state === 0 && c.stateCount === 38);
    expect(growthSwaps.length).toBeLessThanOrEqual(1);
    expect(plant.frame).toBe(0);
  });

  it('G5: Plant() is idempotent — a second call neither resets the clock nor touches the mesh', () => {
    // Arrange
    const plant = makePlant();
    plant.BuildObject();
    plant.Plant();
    plant.Tick(90); // frame 1

    // Act
    plant.Plant();

    // Assert — clock untouched: frame stays 1, planted stays true, visible.
    expect(plant.frame).toBe(1);
    expect(plant.planted).toBe(true);
    expect(plant.object.visible).toBe(true);
  });
});

describe('Plant seeding (CAV-004 S1–S6)', () => {
  let enqueueSeed: jest.Mock;
  let canPlace: jest.Mock;
  let getSeedCells: jest.Mock;

  beforeEach(() => {
    setupTextureDouble();
    enqueueSeed = jest.fn();
    getSeedCells = jest.fn(() => []);
    (EntityService as any).Instance = {
      GetSeedCells: getSeedCells,
      EnqueueSeed: enqueueSeed,
    } as any;
    canPlace = jest.fn(() => false);
    (MapService as any).Instance = { CanPlace: canPlace } as any;
  });

  it('S1: no seeding roll before the window — elapsed < (N-1)*30 produces zero CanPlace calls and zero seeds', () => {
    // Arrange — inject a seed source that would always produce a candidate.
    const source = jest.fn(() => new Vector3(11, 10, 0));
    const plant = makePlant(source);
    plant.BuildObject();
    plant.Plant();

    // Act — N=39 for Bamboo: window at (39-1)*30 = 1140s. Stay below it.
    plant.Tick(1139);

    // Assert
    expect(plant.frame).toBe(18);
    expect(source).not.toHaveBeenCalled();
    expect(canPlace).not.toHaveBeenCalled();
    expect(enqueueSeed).not.toHaveBeenCalled();
  });

  it('S2: cadence — once inside the window, at most one roll per 60s; the roll due exactly at the cadence tick fires', () => {
    // Arrange
    const source = jest.fn(() => null);
    const plant = makePlant(source);
    plant.BuildObject();
    plant.Plant();

    // Act — reach exactly the window (1140s for Bamboo): first roll fires.
    plant.Tick(1140);
    // 59s later: no second roll yet.
    plant.Tick(59);
    expect(source).toHaveBeenCalledTimes(1);

    // 1s more (cumulative 1200s): the next roll fires.
    plant.Tick(1);

    // Assert
    expect(source).toHaveBeenCalledTimes(2);
  });

  it('S3: invalid target — a roll whose cell fails CanPlace enqueues nothing and retries only at the next cadence tick', () => {
    // Arrange
    const cell = new Vector3(9, 10, 0);
    const source = jest.fn(() => cell);
    const plant = makePlant(source);
    plant.BuildObject();
    plant.Plant();
    canPlace.mockReturnValue(false);

    // Act — one roll at the window.
    plant.Tick(1140);
    expect(canPlace).toHaveBeenCalledWith(cell, 2, 1);
    expect(enqueueSeed).not.toHaveBeenCalled();

    // 59s later — still no retry.
    plant.Tick(59);
    expect(canPlace).toHaveBeenCalledTimes(1);

    // Next cadence tick — the retry happens.
    plant.Tick(1);
    expect(canPlace).toHaveBeenCalledTimes(2);
  });

  it('S4: valid target — a CanPlace-valid adjacent cell enqueues a same-type seed via EnqueueSeed', () => {
    // Arrange
    const cell = new Vector3(11, 10, 0);
    const source = jest.fn(() => cell);
    const plant = makePlant(source);
    plant.BuildObject();
    plant.Plant();
    canPlace.mockReturnValue(true);

    // Act
    plant.Tick(1140);

    // Assert
    expect(enqueueSeed).toHaveBeenCalledTimes(1);
    expect(enqueueSeed).toHaveBeenCalledWith(plant, cell);
  });

  it('S5: mature plants keep seeding — rolls continue per cadence past total growing time', () => {
    // Arrange
    const source = jest.fn(() => null);
    const plant = makePlant(source);
    plant.BuildObject();
    plant.Plant();

    // Act — past maturity (2280s) plus a full extra cadence.
    plant.Tick(2280 + 61);

    // Assert — rolls at 1140 (window), 1200, 1260, ..., ≥ 2300: several.
    expect(source.mock.calls.length).toBeGreaterThanOrEqual(2);
  });

  it('S6: default seed source picks a random candidate from GetSeedCells and returns null when none exist', () => {
    // Arrange — the default source is used when none is injected.
    const candidates = [new Vector3(9, 10, 0), new Vector3(11, 10, 0)];
    getSeedCells.mockReturnValue(candidates);
    const plant = makePlant(); // no injected source -> default
    plant.BuildObject();
    plant.Plant();

    // Act — one roll inside the window.
    plant.Tick(1140);

    // Assert — the default source consulted GetSeedCells and CanPlace got
    // one of the candidates (Math.random picked among them).
    expect(getSeedCells).toHaveBeenCalled();
    const checkedCell = canPlace.mock.calls[0][0];
    expect(candidates.map(c => c.x)).toContain(checkedCell.x);

    // Act 2 — empty candidate list: default source returns null, no CanPlace.
    getSeedCells.mockReturnValue([]);
    canPlace.mockClear();
    plant.Tick(60);

    // Assert
    expect(canPlace).not.toHaveBeenCalled();
  });
});

describe('Plant mesh contract (CAV-004 D8)', () => {
  beforeEach(() => {
    setupTextureDouble();
    (EntityService as any).Instance = { GetSeedCells: jest.fn(() => []), EnqueueSeed: jest.fn() } as any;
    (MapService as any).Instance = { CanPlace: jest.fn(() => false) } as any;
  });

  it('BuildObject creates a hidden mesh centered on the footprint, flipped visible only by Plant()', () => {
    // Arrange
    const plant = makePlant();

    // Act
    const object = plant.BuildObject();

    // Assert — 1x2 footprint centered at (10+0.5, 10+1).
    expect(object.visible).toBe(false);
    expect(object.position.x).toBe(10.5);
    expect(object.position.y).toBe(11);

    plant.Plant();
    expect(object.visible).toBe(true);
  });

  it('Seed(cell) returns a planted-by-definition offspring of the same type at the cell', () => {
    // Arrange
    const plant = makePlant();
    const cell = new Vector3(12, 10, 0);

    // Act
    const offspring = plant.Seed(cell);

    // Assert — same concrete type, positioned at the cell; the offspring is
    // planted by definition (D6): visible at frame 0, growth running, no job.
    expect(offspring).toBeInstanceOf(Bamboo);
    expect(offspring.position.x).toBe(12);
    expect(offspring.position.y).toBe(10);
    expect(offspring.planted).toBe(true);
    expect(offspring.IsBuild()).toBe(true);
    const object = offspring.BuildObject();
    expect(object.visible).toBe(true);
  });

  it('Tree carries its measured type data (1 wide x 3 tall, 18 frames)', () => {
    // Arrange + Act
    const tree = new Tree(new Vector3(1, 1, 0));

    // Assert
    expect(tree.name).toBe('Tree');
    expect(tree.width).toBe(1);
    expect(tree.height).toBe(3);
    expect(tree.frameCount).toBe(18);
    expect(tree).toBeInstanceOf(Tree);
    const offspring = tree.Seed(new Vector3(2, 1, 0));
    expect(offspring).toBeInstanceOf(Tree);
  });

  it('exposes the timing constants the architecture fixes (60s per frame, 60s per seed roll)', () => {
    expect(GROWTH_FRAME_SECONDS).toBe(60);
    expect(SEED_ROLL_SECONDS).toBe(60);
    expect(SEED_WINDOW).toBe(120); // (5-1)*60/2 for the N=5 fixture
  });
});
