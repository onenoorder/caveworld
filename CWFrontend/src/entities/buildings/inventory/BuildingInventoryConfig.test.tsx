import { TextureService } from '_services/index';
import {
  BUILDING_SLOT_COUNTS,
  GetSlotCount,
} from '_buildings/index';

// CAV-022 test design suite B (CFG-01..CFG-05): per-building-type slot-count
// configuration — data-driven, exhaustive over the 19 construction types,
// fail-safe for unknown names (plants).

// The catalogue: 6 houses, 3 storages, 10 factories — every concrete
// constructor's super() name (verified against the live tree).
const CATALOGUE: Record<string, number> = {
  MainHouse: 10,
  TinyHouse: 2,
  SmallHouse: 4,
  MediumHouse: 6,
  BigHouse: 8,
  HugeHouse: 10,
  SmallStorageHouse: 12,
  MediumStorageHouse: 24,
  BigStorageHouse: 48,
  Woodworks: 8,
  Stoneworks: 8,
  Steelworks: 8,
  Waterworks: 8,
  ToolFactory: 8,
  CogwheelFactory: 8,
  FoodFactory: 8,
  CharcoalBurner: 8,
  Laboratory: 8,
  CrystalLoadingstation: 8,
};

describe('BuildingInventoryConfig (CAV-022 CFG)', () => {
  beforeEach(() => {
    // Import-order guard: entering the buildings -> services cycle from the
    // services side first is the established convention (Plant.test).
    const fakeTexture = { dispose: jest.fn() } as any;
    (TextureService as any).Instance = {
      Destroy: jest.fn(),
      GetTexture: jest.fn(() => fakeTexture),
      GetBuildingTexture: jest.fn(() => fakeTexture),
      GetBuildingTextureWithState: jest.fn(() => fakeTexture),
    };
  });

  it('CFG-01: every catalogue building name resolves to its configured slot count (AC-1, AC-2)', () => {
    // Arrange + Act + Assert — table-driven over all 19 construction types.
    for (const name of Object.keys(CATALOGUE)) {
      expect(GetSlotCount(name)).toBe(CATALOGUE[name]);
    }
  });

  it('CFG-02: an unknown name resolves to 0 slots — fail-safe, never negative', () => {
    // Arrange
    const unknown = 'NotABuilding';

    // Act + Assert
    expect(GetSlotCount(unknown)).toBe(0);
    expect(GetSlotCount('')).toBe(0);
    expect(GetSlotCount(undefined as any)).toBe(0);
  });

  it('CFG-03: plant names (Bamboo, Tree) resolve to 0 slots — scope guard', () => {
    // Arrange + Act + Assert — plants are not inventory holders.
    expect(GetSlotCount('Bamboo')).toBe(0);
    expect(GetSlotCount('Tree')).toBe(0);
  });

  it('CFG-04: slot counts differ per building type — houses scale, storages are the largest', () => {
    // Arrange
    const values = Object.values(BUILDING_SLOT_COUNTS);

    // Act + Assert — configuration is per-type, not uniform: distinct values
    // exist, the storage family strictly grows, houses stay below storages.
    expect(new Set(values).size).toBeGreaterThan(1);
    expect(GetSlotCount('SmallStorageHouse')).toBeLessThan(GetSlotCount('MediumStorageHouse'));
    expect(GetSlotCount('MediumStorageHouse')).toBeLessThan(GetSlotCount('BigStorageHouse'));
    expect(GetSlotCount('TinyHouse')).toBeLessThan(GetSlotCount('HugeHouse'));
    expect(GetSlotCount('HugeHouse')).toBeLessThan(GetSlotCount('SmallStorageHouse'));
  });

  it('CFG-05: the config record is exhaustive over exactly the 19 construction types', () => {
    // Arrange + Act
    const keys = Object.keys(BUILDING_SLOT_COUNTS);

    // Assert — Record<> gives compile-time exhaustiveness; this pins the
    // runtime shape: 19 keys, all positive integers (slot counts are data).
    expect(keys).toHaveLength(19);
    expect(keys.sort()).toEqual(Object.keys(CATALOGUE).sort());
    for (const value of Object.values(BUILDING_SLOT_COUNTS)) {
      expect(Number.isInteger(value)).toBe(true);
      expect(value).toBeGreaterThan(0);
    }
  });
});

// Barrel regression (CAV-022): the buildings barrel re-exports the inventory
// module for external consumers — InventoryService and the suites import
// through it (architecture D8 import-direction rules).
describe('buildings barrel re-exports (CAV-022)', () => {
  it('exposes the inventory domain module through _buildings/index', () => {
    // Arrange + Act + Assert — reading every runtime export of the barrel
    // guards the re-export surface (see also Building.test.tsx which touches
    // the class exports of every concrete type).
    expect(typeof GetSlotCount).toBe('function');
    expect(typeof BUILDING_SLOT_COUNTS).toBe('object');
  });
});
