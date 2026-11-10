import { Vector3 } from 'three';
import { MapService } from '_services/index';
import { Cave, Map } from '_entities/index';
import { TextureService } from '_services/index';

// CAV-004 M2/M3/M4 (test design 0f67245b): map footprint semantics for the
// confirmed 1x2 (Bamboo) and 1x3 (Tree) footprints — CanPlace validity rules
// and passability after planting (Build clears buildable only; workable and
// paths untouched — architecture D7). Real MapService instance with scene /
// renderer / Cave doubles (boundary mocking per the test strategy).

function makeCellGraphDouble() {
  return { AddPosition: jest.fn() };
}

function setupMap(width = 40, height = 30) {
  const scene = { add: jest.fn(), remove: jest.fn() } as any;
  const renderer = {} as any;
  (MapService as any).Instance = undefined;
  // Cave's constructor drives the renderer; the strategy allow-lists Cave,
  // so double it at the module boundary.
  const caveDouble = { BuildObject: () => ({}), Destroy: jest.fn(), Rebuild: jest.fn(), UpdateTextureOnPosition: jest.fn(), Tick: jest.fn() };
  const caveCtor = Cave;
  const mapDouble = { BuildObject: () => ({}), Destroy: jest.fn() };
  const mapCtor = Map;
  jest.mock('_entities/index', () => ({
    ...jest.requireActual('_entities/index'),
    Cave: jest.fn(() => caveDouble),
    Map: jest.fn(() => mapDouble),
  }));
  MapService.Setup(scene, renderer, height, width);
  void caveCtor; void mapCtor;
  return MapService.Instance;
}

function dig(map: MapService, x: number, y: number) {
  // Free is the only buildable=true setter — simulates a dug cell.
  map.Free(new Vector3(x, y, 0), 1, 1);
}

describe('MapService plant placement semantics (CAV-004 M2/M3/M4)', () => {
  beforeEach(() => {
    const fakeTexture = { dispose: jest.fn() } as any;
    (TextureService as any).Instance = {
      Destroy: jest.fn(),
      GetTexture: jest.fn(() => fakeTexture),
      GetBuildingTexture: jest.fn(() => fakeTexture),
      GetBuildingTextureWithState: jest.fn(() => fakeTexture),
    };
    void makeCellGraphDouble;
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
    // Arrange
    const map = setupMap(40, 30);
    for (let x = 0; x < 40; x++)
      for (let y = 0; y < 30; y++)
        dig(map, x, y);

    // Act + Assert
    expect(map.CanPlace(new Vector3(-1, 0, 0), 2, 1)).toBe(false); // x < 0
    expect(map.CanPlace(new Vector3(0, -1, 0), 2, 1)).toBe(false); // y < 0
    expect(map.CanPlace(new Vector3(40, 0, 0), 2, 1)).toBe(false); // x + w > width
    expect(map.CanPlace(new Vector3(0, 29, 0), 2, 1)).toBe(false); // y + h > height
    expect(map.CanPlace(new Vector3(0, 28, 0), 2, 1)).toBe(true);  // edge-fit ok
  });

  it('M2: planting clears buildable only — workable stays true (cells remain passable) and paths untouched', () => {
    // Arrange
    const map = setupMap();
    const addPosition = jest.spyOn((map as any).paths, 'AddPosition');
    for (let x = 10; x <= 14; x++)
      for (let y = 5; y <= 9; y++)
        dig(map, x, y);

    // Act — plant a Bamboo at (10,5): footprint cells (10,5) and (10,6).
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
