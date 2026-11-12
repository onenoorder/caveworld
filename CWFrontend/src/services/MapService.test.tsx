import { Vector3 } from 'three';
import { MapService } from '_services/index';
import { TextureService } from '_services/index';

// CAV-004 M2/M3/M4 (test design 0f67245b): map footprint semantics for the
// confirmed 1x2 (Bamboo) and 1x3 (Tree) footprints — CanPlace validity rules
// and passability after planting (Build clears buildable only; workable and
// paths untouched — architecture D7). Real MapService instance with scene /
// renderer / Cave doubles (boundary mocking per the test strategy).

// Cave's constructor drives the renderer and queries TextureService; the
// strategy allow-lists Cave, so it is doubled at the module boundary. The
// real Map entity is inert under Jest (pure Three.js objects) and stays
// real. The factory is hoisted by Jest above every import and must be
// fully self-contained (no out-of-scope references). Cave is doubled with
// a PLAIN constructor, not jest.fn: CRA's Jest config sets resetMocks:
// true, which would strip a jest.fn implementation before the first test
// and turn `new Cave(...)` into an empty mock instance.
jest.mock('_entities/index', () => ({
  ...jest.requireActual('_entities/index'),
  Cave: function CaveDouble() {
    return {
      BuildObject: () => ({}),
      Destroy: () => undefined,
      Rebuild: () => undefined,
      UpdateTextureOnPosition: () => undefined,
      Tick: () => undefined,
    };
  },
}));

// Cave's constructor reads TextureService.Instance.GetExcavationTexture, so
// the double must exist before the first MapService.Setup call.
const fakeTexture = { dispose: jest.fn() } as any;

function setupTextureDouble() {
  (TextureService as any).Instance = {
    Destroy: jest.fn(),
    GetTexture: jest.fn(() => fakeTexture),
    GetBuildingTexture: jest.fn(() => fakeTexture),
    GetBuildingTextureWithState: jest.fn(() => fakeTexture),
    GetExcavationTexture: jest.fn(() => fakeTexture),
  };
}

function setupMap(width = 40, height = 30) {
  const scene = { add: jest.fn(), remove: jest.fn() } as any;
  const renderer = {} as any;
  (MapService as any).Instance = undefined;
  MapService.Setup(scene, renderer, height, width);
  return MapService.Instance;
}

function dig(map: MapService, x: number, y: number) {
  // Free is the only buildable=true setter — simulates a dug cell.
  map.Free(new Vector3(x, y, 0), 1, 1);
}

describe('MapService plant placement semantics (CAV-004 M2/M3/M4)', () => {
  beforeEach(() => {
    setupTextureDouble();
  });

  afterEach(() => {
    jest.dontMock('_entities/index');
    jest.restoreAllMocks();
  });

  it('M3: dug open cells accept the 1x2 and 1x3 plant footprints', () => {
    // Arrange
    const map = setupMap();
    for (let x = 10; x <= 14; x++)
      for (let y = 5; y <= 9; y++)
        dig(map, x, y);

    // Act + Assert
    expect(map.CanPlace(new Vector3(10, 5, 0), 2, 1)).toBe(true); // Bamboo 1x2
    expect(map.CanPlace(new Vector3(12, 5, 0), 3, 1)).toBe(true); // Tree 1x3
  });

  it('M3: undug rock rejects both footprints', () => {
    // Arrange
    const map = setupMap();

    // Act + Assert — nothing freed: all rock.
    expect(map.CanPlace(new Vector3(10, 5, 0), 2, 1)).toBe(false);
    expect(map.CanPlace(new Vector3(10, 5, 0), 3, 1)).toBe(false);
  });

  it('M3: footprint overlap rejects (a cell already built on)', () => {
    // Arrange
    const map = setupMap();
    for (let x = 10; x <= 14; x++)
      for (let y = 5; y <= 9; y++)
        dig(map, x, y);
    map.Build(new Vector3(11, 5, 0), 1, 1);

    // Act + Assert — Bamboo at (10,5) spans y 5..6, x 10: still fine;
    // a Bamboo overlapping (11,5) must fail.
    expect(map.CanPlace(new Vector3(10, 5, 0), 2, 1)).toBe(true);
    expect(map.CanPlace(new Vector3(11, 5, 0), 2, 1)).toBe(false);
  });

  it('M3: a workable cell in the row above the footprint rejects (low ceiling for the 3-tall Tree)', () => {
    // Arrange
    const map = setupMap();
    for (let x = 10; x <= 14; x++)
      for (let y = 3; y <= 9; y++)
        dig(map, x, y);

    // Tree at (10,3) spans y 3..5; row above is y 2 — undug rock: workable
    // is false there, so the tree fits...
    expect(map.CanPlace(new Vector3(10, 3, 0), 3, 1)).toBe(true);

    // ...until y2 is dug (workable) — then the ceiling rule rejects it.
    dig(map, 10, 2);
    expect(map.CanPlace(new Vector3(10, 3, 0), 3, 1)).toBe(false);
    // Bamboo (1x2) still fits under the same ledge at y 4..5? Its row above
    // is y 3 (workable after the dig) -> rejected too at (10,4). At (10,4):
    // row above is y=3 which is workable => false.
    expect(map.CanPlace(new Vector3(10, 4, 0), 2, 1)).toBe(false);
  });

  it('M3: out-of-bounds rejects on every edge', () => {
    // Arrange — map 40 wide x 30 tall with everything dug EXCEPT the top
    // row (y=29): the ceiling rule (workable row above rejects) would
    // otherwise mask the pure bounds checks for any 2-tall footprint.
    const map = setupMap(40, 30);
    for (let x = 0; x < 40; x++)
      for (let y = 0; y < 29; y++)
        dig(map, x, y);

    // Act + Assert
    expect(map.CanPlace(new Vector3(-1, 0, 0), 2, 1)).toBe(false); // x < 0
    expect(map.CanPlace(new Vector3(0, -1, 0), 2, 1)).toBe(false); // y < 0
    expect(map.CanPlace(new Vector3(40, 0, 0), 1, 1)).toBe(false); // x + w > width
    expect(map.CanPlace(new Vector3(0, 29, 0), 1, 1)).toBe(false); // y + h > height
    expect(map.CanPlace(new Vector3(39, 0, 0), 1, 1)).toBe(true);  // right-edge fit
    // Bottom edge-fit: spans y 0..1 with no row above (y = -1 is undefined,
    // not workable) — the ceiling rule is undefined-safe at y = 0.
    expect(map.CanPlace(new Vector3(0, 0, 0), 2, 1)).toBe(true);
  });

  it('M2: planting clears buildable only — workable stays true (cells remain passable) and paths untouched', () => {
    // Arrange
    const map = setupMap();
    const addPosition = jest.spyOn((map as any).paths, 'AddPosition');
    for (let x = 10; x <= 14; x++)
      for (let y = 5; y <= 9; y++)
        dig(map, x, y);

    // Act — plant a Bamboo at (10,5): footprint cells (10,5) and (10,6).
    // The spy is cleared after the Arrange digs: Free/AddPosition calls from
    // setting up the test map are not the behavior under test.
    addPosition.mockClear();
    map.Build(new Vector3(10, 5, 0), 2, 1);

    // Assert — buildable consumed...
    expect(map.CanPlace(new Vector3(10, 5, 0), 2, 1)).toBe(false);
    // ...workable (passability) unchanged, so dwarfs can still stand there...
    expect(map.IsFree(new Vector3(10, 5, 0))).toBe(true);
    expect(map.IsFree(new Vector3(10, 6, 0))).toBe(true);
    // ...and the path graph saw no mutation from planting.
    expect(addPosition).not.toHaveBeenCalled();
  });

  it('M4: double-planting the same cells is rejected after the first plant consumes buildable', () => {
    // Arrange
    const map = setupMap();
    for (let x = 10; x <= 14; x++)
      for (let y = 5; y <= 9; y++)
        dig(map, x, y);

    // Act
    map.Build(new Vector3(10, 5, 0), 2, 1);

    // Assert — the same footprint (and any overlapping placement) fails.
    expect(map.CanPlace(new Vector3(10, 5, 0), 2, 1)).toBe(false);
    expect(map.CanPlace(new Vector3(10, 6, 0), 2, 1)).toBe(false); // overlaps (10,6)
  });
});
