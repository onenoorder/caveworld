import { Vector3 } from 'three';
// Import order matters: entering the buildings -> services -> factories ->
// houses require cycle from the services side first is the established
// convention (Plant.test / EntityService.test).
import { InventoryService, JobService, TextureService, EntityService, MapService } from '_services/index';
import { Bamboo, Tree, Slot } from '_buildings/index';
import { MainHouse, TinyHouse } from '_houses/index';
import { ItemIds } from '_utilities/Enums';

// CAV-022 test design suite C (SVC-01..SVC-14): the rewritten InventoryService
// — stateless controller facade, state === 4 acceptance gate (the R1 trap:
// MainHouse is born built with IsBuild() false forever), capacity-first
// transfer, read API, repurpose regression.

function setupTextureDouble() {
  const fakeTexture = { dispose: jest.fn() } as any;
  (TextureService as any).Instance = {
    Destroy: jest.fn(),
    GetTexture: jest.fn(() => fakeTexture),
    GetBuildingTexture: jest.fn(() => fakeTexture),
    GetBuildingTextureWithState: jest.fn(() => fakeTexture),
  };
}

function setupService(): InventoryService {
  InventoryService.Setup();
  return InventoryService.Instance;
}

// A built variant of a construction building: drives the real Build path to
// state 4 (TinyHouse buildTotal = 2*2*10 = 40).
function buildTinyHouse(): TinyHouse {
  const house = new TinyHouse(new Vector3(0, 0, 0));
  house.BuildObject();
  house.Build(10);
  house.Build(10);
  house.Build(10);
  house.Build(10);
  expect(house.state).toBe(4);
  return house;
}

describe('InventoryService (CAV-022 SVC)', () => {
  beforeEach(() => {
    setupTextureDouble();
    (EntityService as any).Instance = { GetSeedCells: jest.fn(() => []), EnqueueSeed: jest.fn() } as any;
    (MapService as any).Instance = { CanPlace: jest.fn(() => false) } as any;
  });

  it('SVC-01: Setup creates the singleton; Setup again recreates it; Destroy is a contract no-op', () => {
    // Arrange
    InventoryService.Setup();
    const first = InventoryService.Instance;

    // Act
    InventoryService.Setup();
    const second = InventoryService.Instance;

    // Assert — singleton shape preserved (D9): re-Setup replaces, the new
    // instance is fresh and usable.
    expect(second).not.toBe(first);
    expect(InventoryService.Instance).toBe(second);
    expect(() => second.Destroy()).not.toThrow();
  });

  it('SVC-02: Add rejects everything while state < 4 — inventory exists, accepts nothing (AC, D5)', () => {
    // Arrange
    const service = setupService();
    const unbuilt = new TinyHouse(new Vector3(0, 0, 0));
    expect(unbuilt.state).toBe(0);

    // Act
    const result = service.Add(unbuilt, ItemIds.Wood, 10);

    // Assert
    expect(result).toEqual({ accepted: 0, rejected: 10 });
    expect(unbuilt.inventory.slotCount).toBe(2); // exists — but stays empty
    expect(unbuilt.inventory.GetSlots()[0].count).toBe(0);
  });

  it('SVC-03: Add works the moment the building reaches state 4 via the real Build path (D5)', () => {
    // Arrange
    const service = setupService();
    const house = new TinyHouse(new Vector3(0, 0, 0));
    house.BuildObject();

    // Act — build to completion (40 progress, one state level per Build
    // call per the base's else-if chain), then add.
    house.Build(10);
    house.Build(10);
    house.Build(10);
    house.Build(10);
    expect(house.state).toBe(4);
    const result = service.Add(house, ItemIds.Wood, 10);

    // Assert
    expect(result).toEqual({ accepted: 10, rejected: 0 });
    expect(house.inventory.GetSlots()[0].count).toBe(10);
  });

  it('SVC-04: MainHouse accepts at spawn — born state 4 despite IsBuild() being false forever (R1)', () => {
    // Arrange
    const service = setupService();
    const mainHouse = new MainHouse(new Vector3(0, 0, 0));

    // Act
    const result = service.Add(mainHouse, ItemIds.Food, 7);

    // Assert — the single most likely implementation trap, pinned.
    expect(mainHouse.state).toBe(4);
    expect(mainHouse.IsBuild()).toBe(false);
    expect(result).toEqual({ accepted: 7, rejected: 0 });
    expect(service.GetBuildingStock(mainHouse)[0].count).toBe(7);
  });

  it('SVC-05: unbuilt read always works — GetBuildingStock reports an empty stock (D5)', () => {
    // Arrange
    const service = setupService();
    const unbuilt = new TinyHouse(new Vector3(0, 0, 0));

    // Act
    const stock = service.GetBuildingStock(unbuilt);

    // Assert — read APIs are never gated.
    expect(stock).toHaveLength(2);
    expect(stock.every(slot => slot.count === 0)).toBe(true);
  });

  it('SVC-06: Add enforces the 64 cap through the service path (AC-4, CAV-020 boundary)', () => {
    // Arrange — TinyHouse has 2 slots → 128 capacity for one type.
    const service = setupService();
    const house = buildTinyHouse();

    // Act — 129 Wood: slot 0 takes 64, slot 1 takes 64, the 129th does not
    // fit a full slot and is rejected; a further add has no room at all.
    const over = service.Add(house, ItemIds.Wood, 129);
    const more = service.Add(house, ItemIds.Wood, 10);

    // Assert — the per-slot 64 cap splits the first add across both slots
    // (the single-slot 65th-item case is INV-03); both slots end full.
    expect(over).toEqual({ accepted: 128, rejected: 1 });
    expect(more).toEqual({ accepted: 0, rejected: 10 });
    expect(house.inventory.GetSlots().map(slot => slot.count)).toEqual([64, 64]);
  });

  it('SVC-07: Remove decrements counts, never whole stacks (AC-5, D7)', () => {
    // Arrange
    const service = setupService();
    const house = buildTinyHouse();
    service.Add(house, ItemIds.Wood, 64);

    // Act
    const result = service.Remove(house, ItemIds.Wood, 5);

    // Assert — 59 remain in the slot; the stack was decremented, not removed.
    expect(result).toEqual({ removed: 5, missing: 0 });
    const slots = service.GetBuildingStock(house);
    expect(slots[0].itemType).toBe(ItemIds.Wood);
    expect(slots[0].count).toBe(59);
  });

  it('SVC-08: Remove reports the shortage when more is requested than held', () => {
    // Arrange
    const service = setupService();
    const house = buildTinyHouse();
    service.Add(house, ItemIds.Stone, 10);

    // Act
    const result = service.Remove(house, ItemIds.Stone, 15);

    // Assert
    expect(result).toEqual({ removed: 10, missing: 5 });
    expect(service.GetBuildingStock(house)[0].count).toBe(0);
  });

  it('SVC-09: Remove is not state-gated — an unbuilt (empty) building reports everything missing', () => {
    // Arrange
    const service = setupService();
    const unbuilt = new TinyHouse(new Vector3(0, 0, 0));

    // Act
    const result = service.Remove(unbuilt, ItemIds.Wood, 4);

    // Assert — no gate, no crash: unbuilt stock is empty by construction.
    expect(result).toEqual({ removed: 0, missing: 4 });
  });

  it('SVC-10: Transfer moves min(available, capacity, qty) — a partial move is a success (D7)', () => {
    // Arrange — source MainHouse (10 slots) holding 70 Wood, target built
    // TinyHouse (2 slots) with a 40-partial: target capacity 88.
    const service = setupService();
    const source = new MainHouse(new Vector3(0, 0, 0));
    const target = buildTinyHouse();
    service.Add(source, ItemIds.Wood, 70);
    service.Add(target, ItemIds.Wood, 40);

    // Act — request 100: source available 70, target capacity 88 → moves 70.
    const result = service.Transfer(source, target, ItemIds.Wood, 100);

    // Assert — clamped by the SOURCE: nothing rolled back, nothing lost,
    // nothing created.
    expect(result.moved).toBe(70);
    expect(service.Count(source, ItemIds.Wood)).toBe(0);
    expect(service.GetBuildingStock(source).every(slot => slot.count === 0)).toBe(true);
    const targetCounts = service.GetBuildingStock(target).map(slot => slot.count);
    expect(targetCounts).toEqual([64, 46]);
  });

  it('SVC-10b: Transfer is capacity-clamped — a full target moves only the partial room', () => {
    // Arrange — source 100 Wood; target (built TinyHouse, 2 slots) already
    // holding 100 Stone: target Wood capacity is 0... only through empty
    // slots: 2 slots full of Stone → 0 capacity.
    const service = setupService();
    const source = new MainHouse(new Vector3(0, 0, 0));
    const target = buildTinyHouse();
    service.Add(source, ItemIds.Wood, 100);
    service.Add(target, ItemIds.Stone, 100);

    // Act — plenty available, zero capacity → moves 0, source intact.
    const result = service.Transfer(source, target, ItemIds.Wood, 100);

    // Assert
    expect(result.moved).toBe(0);
    expect(service.Count(source, ItemIds.Wood)).toBe(100);
  });

  it('SVC-11: plants hold no stock through the service — Add accepted 0 (scope guard, R5)', () => {
    // Arrange
    const service = setupService();
    const plant = new Bamboo(new Vector3(0, 0, 0));

    // Act + Assert — born state 0 and 0 slots: rejected on both grounds.
    expect(service.Add(plant, ItemIds.Wood, 1)).toEqual({ accepted: 0, rejected: 1 });
    expect(service.CanAccept(plant, ItemIds.Wood, 1)).toBe(0);
    expect(service.GetBuildingStock(plant)).toEqual([]);
    expect(service.Transfer(plant, new MainHouse(new Vector3(0, 0, 0)), ItemIds.Wood, 1).moved).toBe(0);
  });

  it('SVC-12: CanAccept is 0 while unbuilt and free capacity once built (D7, CAV-023 planning query)', () => {
    // Arrange
    const service = setupService();
    const unbuilt = new TinyHouse(new Vector3(0, 0, 0));

    // Act + Assert
    expect(service.CanAccept(unbuilt, ItemIds.Wood, 10)).toBe(0);
    const built = buildTinyHouse();
    expect(service.CanAccept(built, ItemIds.Wood, 999)).toBe(128); // 2 slots
    service.Add(built, ItemIds.Wood, 30);
    expect(service.CanAccept(built, ItemIds.Wood, 999)).toBe(98); // partial room 34 + empty 64
  });

  it('SVC-13: GetBuildingStock returns snapshot copies — mutating them cannot affect the building', () => {
    // Arrange
    const service = setupService();
    const house = buildTinyHouse();
    service.Add(house, ItemIds.Wood, 5);

    // Act
    const stock: Slot[] = service.GetBuildingStock(house);
    stock[0].count = 999;
    stock[0].itemType = null;

    // Assert — the building's real state is unchanged.
    expect(service.GetBuildingStock(house)[0].count).toBe(5);
    expect(service.GetBuildingStock(house)[0].itemType).toBe(ItemIds.Wood);
  });

  it('SVC-14: repurpose regression — the job-queue code is gone; JobService is untouched (D9, R6)', () => {
    // Arrange + Act + Assert — the rewritten service exposes only the
    // inventory API surface; the stale AddJob/Remove/Find/jobs members from
    // the dead JobService duplicate are deleted.
    const service = setupService();
    expect((service as any).AddJob).toBeUndefined();
    expect((service as any).jobs).toBeUndefined();
    expect((service as any).Find).toBeUndefined();
    expect(typeof service.Add).toBe('function');
    expect(typeof service.Remove).toBe('function');
    expect(typeof service.Transfer).toBe('function');
    expect(typeof service.CanAccept).toBe('function');
    expect(typeof service.GetBuildingStock).toBe('function');

    // JobService still carries the job queue, unmerged and independent.
    JobService.Setup();
    const jobService = JobService.Instance;
    expect((jobService as any).jobs).toEqual([]);
    expect(typeof (jobService as any).AddJob).toBe('function');
    expect(JobService).not.toBe(InventoryService);
  });
});
