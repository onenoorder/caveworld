import { Vector3 } from 'three';
import { BuildingFactory } from '_factories/BuildingFactory';
import { BuildingIds } from '_utilities/Enums';
import { Bamboo, Tree, GetSlotCount, BUILDING_SLOT_COUNTS } from '_buildings/index';
import { TinyHouse } from '_houses/index';

// CAV-004 F1/F2 (test design 0f67245b): factory mapping for the two plant
// types and identifier/exports — guards the verified `default:` fallthrough
// to TinyHouse in BuildingFactory.Build (risk R1) and the measured plant
// texture counts (risk R5; measured by the crop contract render 87407bec block D).
describe('BuildingFactory plant mapping (CAV-004 F1)', () => {
  it('builds a Bamboo (1 wide x 2 tall, 33 measured states) for BuildingIds.Bamboo — never a TinyHouse', () => {
    // Arrange + Act
    const bamboo = BuildingFactory.Build(BuildingIds.Bamboo, new Vector3(5, 5, 0));

    // Assert
    expect(bamboo).toBeInstanceOf(Bamboo);
    expect(bamboo.name).toBe('Bamboo');
    expect(bamboo.width).toBe(1);
    expect(bamboo.height).toBe(2);
    expect((bamboo as Bamboo).frameCount).toBe(33);
    expect(bamboo).not.toBeInstanceOf(TinyHouse);
  });

  it('builds a Tree (1 wide x 3 tall, 16 states) for BuildingIds.Tree — never a TinyHouse', () => {
    // Arrange + Act
    const tree = BuildingFactory.Build(BuildingIds.Tree, new Vector3(5, 5, 0));

    // Assert
    expect(tree).toBeInstanceOf(Tree);
    expect(tree.name).toBe('Tree');
    expect(tree.width).toBe(1);
    expect(tree.height).toBe(3);
    expect((tree as Tree).frameCount).toBe(16);
    expect(tree).not.toBeInstanceOf(TinyHouse);
  });

  it('keeps the plant ids distinct from every existing building id', () => {
    // Arrange + Act + Assert — distinct enum members, appended after the
    // last existing id (CrystalLoadingstation), per the render toolbar spec.
    expect(BuildingIds.Bamboo).not.toBe(BuildingIds.Tree);
    expect(BuildingIds.Bamboo).toBeGreaterThan(BuildingIds.CrystalLoadingstation);
    expect(BuildingIds.Tree).toBeGreaterThan(BuildingIds.CrystalLoadingstation);
  });
});

describe('BuildingIds plant exports (CAV-004 F2)', () => {
  it('exports Bamboo and Tree through the enum barrel', () => {
    // Arrange + Act + Assert — the barrel re-export is exercised implicitly
    // by the imports above; the named members must exist as enum values.
    expect(BuildingIds).toHaveProperty('Bamboo');
    expect(BuildingIds).toHaveProperty('Tree');
    expect(typeof BuildingIds.Bamboo).toBe('number');
    expect(typeof BuildingIds.Tree).toBe('number');
  });
});

// CAV-022 FTY-01: the factory path attaches the configured inventory to every
// factory-built construction type (the direct-construction path is covered by
// Building.test BLD-02). Table-driven over the 18 factory-built catalogue ids.
describe('BuildingFactory inventory initialization (CAV-022 FTY-01)', () => {
  const position = new Vector3(5, 5, 0);

  it('builds every construction type with its configured slot count (AC-1)', () => {
    // Arrange — every catalogue id except MainHouse (factory-built set).
    const constructionIds: BuildingIds[] = [
      BuildingIds.TinyHouse, BuildingIds.SmallHouse, BuildingIds.MediumHouse,
      BuildingIds.BigHouse, BuildingIds.HugeHouse,
      BuildingIds.SmallStorageHouse, BuildingIds.MediumStorageHouse, BuildingIds.BigStorageHouse,
      BuildingIds.Woodworks, BuildingIds.Stoneworks, BuildingIds.Steelworks,
      BuildingIds.Waterworks, BuildingIds.ToolFactory, BuildingIds.CogwheelFactory,
      BuildingIds.FoodFactory, BuildingIds.CharcoalBurner, BuildingIds.Laboratory,
      BuildingIds.CrystalLoadingstation,
    ];

    // Act + Assert — each factory-built building initializes its inventory
    // from the config keyed by its concrete name.
    expect(constructionIds).toHaveLength(18);
    for (const id of constructionIds) {
      const building = BuildingFactory.Build(id, position);
      expect(building.inventory.slotCount).toBe(GetSlotCount(building.name));
      expect(building.inventory.slotCount).toBe((BUILDING_SLOT_COUNTS as any)[building.name]);
      expect(building.inventory.slotCount).toBeGreaterThan(0);
    }
  });

  it('plants built through the factory carry an inert 0-slot inventory (scope guard)', () => {
    // Arrange + Act
    const bamboo = BuildingFactory.Build(BuildingIds.Bamboo, position);
    const tree = BuildingFactory.Build(BuildingIds.Tree, position);

    // Assert — plants are not inventory holders, on the factory path too.
    expect(bamboo.inventory.slotCount).toBe(0);
    expect(tree.inventory.slotCount).toBe(0);
    expect(bamboo.inventory.GetSlots()).toEqual([]);
  });

  it('the default fallthrough (an unknown id) still builds a TinyHouse with its configured inventory', () => {
    // Arrange + Act — the known default: case fallthrough guards the switch.
    const building = BuildingFactory.Build(-1 as BuildingIds, position);

    // Assert
    expect(building).toBeInstanceOf(TinyHouse);
    expect(building.inventory.slotCount).toBe(2);
  });
});
