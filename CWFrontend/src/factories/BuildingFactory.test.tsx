import { Vector3 } from 'three';
import { BuildingFactory } from '_factories/BuildingFactory';
import { BuildingIds } from '_utilities/Enums';
import { Bamboo, Tree } from '_buildings/index';
import { TinyHouse } from '_houses/index';

// CAV-004 F1/F2 (test design 0f67245b): factory mapping for the two plant
// types and identifier/exports — guards the verified `default:` fallthrough
// to TinyHouse in BuildingFactory.Build (risk R1) and the measured frame
// counts from the nursery sheets (risk R5; measured by scripts/analyze-sheets.js
// per crop contract render 87407bec block D).
describe('BuildingFactory plant mapping (CAV-004 F1)', () => {
  it('builds a Bamboo (1 wide x 2 tall, 39 measured frames) for BuildingIds.Bamboo — never a TinyHouse', () => {
    // Arrange + Act
    const bamboo = BuildingFactory.Build(BuildingIds.Bamboo, new Vector3(5, 5, 0));

    // Assert
    expect(bamboo).toBeInstanceOf(Bamboo);
    expect(bamboo.name).toBe('Bamboo');
    expect(bamboo.width).toBe(1);
    expect(bamboo.height).toBe(2);
    expect((bamboo as Bamboo).frameCount).toBe(39);
    expect(bamboo).not.toBeInstanceOf(TinyHouse);
  });

  it('builds a Tree (1 wide x 3 tall, 18 measured frames) for BuildingIds.Tree — never a TinyHouse', () => {
    // Arrange + Act
    const tree = BuildingFactory.Build(BuildingIds.Tree, new Vector3(5, 5, 0));

    // Assert
    expect(tree).toBeInstanceOf(Tree);
    expect(tree.name).toBe('Tree');
    expect(tree.width).toBe(1);
    expect(tree.height).toBe(3);
    expect((tree as Tree).frameCount).toBe(18);
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
