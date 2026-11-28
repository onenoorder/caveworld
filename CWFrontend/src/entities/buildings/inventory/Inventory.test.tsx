import { Inventory } from './Inventory';
import { STACK_SIZE_LIMIT } from './IInventory';
import { ItemIds } from '_utilities/Enums';

// CAV-022 test design suite A (INV-01..INV-16): domain slot rules — 64-cap,
// one-type-per-slot, partials-first allocation, decrement-only removal,
// snapshot reads, serializable shape. Pure module — no doubles needed.

describe('Inventory slot model (CAV-022 INV)', () => {
  it('INV-01: a new inventory has slotCount empty slots — null type, count 0', () => {
    // Arrange
    const inventory = new Inventory(3);

    // Act
    const slots = inventory.GetSlots();

    // Assert
    expect(inventory.slotCount).toBe(3);
    expect(slots).toHaveLength(3);
    for (const slot of slots) {
      expect(slot.itemType).toBeNull();
      expect(slot.count).toBe(0);
    }
  });

  it('INV-02: STACK_SIZE_LIMIT is fixed at 64 (CAV-020 framing)', () => {
    // Arrange + Act + Assert
    expect(STACK_SIZE_LIMIT).toBe(64);
  });

  it('INV-03: items stack up to 64 in one slot — the 65th does not fit and is reported', () => {
    // Arrange
    const inventory = new Inventory(1);

    // Act
    const result = inventory.Add(ItemIds.Wood, 65);

    // Assert
    expect(result).toEqual({ accepted: 64, rejected: 1 });
    const slots = inventory.GetSlots();
    expect(slots[0].itemType).toBe(ItemIds.Wood);
    expect(slots[0].count).toBe(64);
  });

  it('INV-04: a different item type never enters a partial slot — it goes to an empty slot (AC-3)', () => {
    // Arrange
    const inventory = new Inventory(2);

    // Act
    inventory.Add(ItemIds.Wood, 10);
    const result = inventory.Add(ItemIds.Stone, 5);

    // Assert
    expect(result).toEqual({ accepted: 5, rejected: 0 });
    const slots = inventory.GetSlots();
    expect(slots[0].itemType).toBe(ItemIds.Wood);
    expect(slots[0].count).toBe(10);
    expect(slots[1].itemType).toBe(ItemIds.Stone);
    expect(slots[1].count).toBe(5);
  });

  it('INV-05: a different item type with no empty slot is rejected with a reported remainder', () => {
    // Arrange — one slot, fully held by Wood.
    const inventory = new Inventory(1);
    inventory.Add(ItemIds.Wood, 64);

    // Act
    const result = inventory.Add(ItemIds.Stone, 5);

    // Assert
    expect(result).toEqual({ accepted: 0, rejected: 5 });
    expect(inventory.GetSlots()[0].itemType).toBe(ItemIds.Wood);
    expect(inventory.GetSlots()[0].count).toBe(64);
  });

  it('INV-06: allocation order is deterministic — partial matching slots first, then empty slots, in index order', () => {
    // Arrange — reachable state via the API: slot0 Wood 5 (partial), slot1
    // Stone 9, slot2 empty. A same-type add always fills the existing partial
    // before touching an empty slot (D6).
    const inventory = new Inventory(3);
    inventory.Add(ItemIds.Wood, 5);      // slot 0: Wood 5
    inventory.Add(ItemIds.Stone, 9);     // slot 1: Stone 9
                                       // slot 2: empty

    // Act — 30 Wood fits entirely in the partial (room 59).
    const result = inventory.Add(ItemIds.Wood, 30);

    // Assert
    expect(result).toEqual({ accepted: 30, rejected: 0 });
    const slots = inventory.GetSlots();
    expect(slots[0].itemType).toBe(ItemIds.Wood);
    expect(slots[0].count).toBe(35);  // 5 + 30 — partial filled first
    expect(slots[1].count).toBe(9);   // different type untouched
    expect(slots[2].itemType).toBeNull(); // empty slot not used while partial had room
  });

  it('INV-06b: after partials are full, allocation continues into empty slots in index order', () => {
    // Arrange — slot 0: Wood 60 (room for 4).
    const inventory = new Inventory(3);
    inventory.Add(ItemIds.Wood, 60);

    // Act — 70 Wood: 4 fill slot 0, 64 fill slot 1, 2 go to slot 2.
    const result = inventory.Add(ItemIds.Wood, 70);

    // Assert
    expect(result).toEqual({ accepted: 70, rejected: 0 });
    const slots = inventory.GetSlots();
    expect(slots[0].count).toBe(64);
    expect(slots[1].itemType).toBe(ItemIds.Wood);
    expect(slots[1].count).toBe(64);
    expect(slots[2].count).toBe(2);
  });

  it('INV-07: accepted + rejected === qty — nothing is silently dropped on every add', () => {
    // Arrange
    const cases: { slots: number, items: ItemIds, qty: number }[] = [
      { slots: 1, items: ItemIds.Wood, qty: 65 },
      { slots: 1, items: ItemIds.Stone, qty: 200 },
      { slots: 2, items: ItemIds.Food, qty: 129 },
      { slots: 0, items: ItemIds.Tool, qty: 10 },
      { slots: 3, items: ItemIds.Crystal, qty: 0 },
    ];
    for (const { slots: slotCount, items, qty } of cases) {
      const inventory = new Inventory(slotCount);

      // Act
      const result = inventory.Add(items, qty);

      // Assert — the loss-free invariant (R3).
      expect(result.accepted + result.rejected).toBe(qty);
    }
  });

  it('INV-08: qty <= 0 is a no-op returning zeros', () => {
    // Arrange
    const inventory = new Inventory(2);

    // Act
    expect(inventory.Add(ItemIds.Wood, 0)).toEqual({ accepted: 0, rejected: 0 });
    expect(inventory.Add(ItemIds.Wood, -3)).toEqual({ accepted: 0, rejected: 0 });
    expect(inventory.Remove(ItemIds.Wood, 0)).toEqual({ removed: 0, missing: 0 });
    expect(inventory.Remove(ItemIds.Wood, -2)).toEqual({ removed: 0, missing: 0 });

    // Assert — state untouched.
    expect(inventory.GetSlots()).toEqual([
      { itemType: null, count: 0 },
      { itemType: null, count: 0 },
    ]);
  });

  it('INV-09: removal decrements counts — removing 5 from a 64-stack leaves 59', () => {
    // Arrange
    const inventory = new Inventory(1);
    inventory.Add(ItemIds.Wood, 64);

    // Act
    const result = inventory.Remove(ItemIds.Wood, 5);

    // Assert — the stack is decremented, never implicitly removed.
    expect(result).toEqual({ removed: 5, missing: 0 });
    expect(inventory.GetSlots()[0].itemType).toBe(ItemIds.Wood);
    expect(inventory.GetSlots()[0].count).toBe(59);
  });

  it('INV-10: removing more than available reports the shortage; counts never go negative', () => {
    // Arrange
    const inventory = new Inventory(1);
    inventory.Add(ItemIds.Wood, 10);

    // Act
    const result = inventory.Remove(ItemIds.Wood, 15);

    // Assert
    expect(result).toEqual({ removed: 10, missing: 5 });
    expect(inventory.GetSlots()[0].count).toBe(0);
    expect(inventory.GetSlots()[0].itemType).toBeNull();
  });

  it('INV-11: remove decrements across matching slots in index order; a slot empties only at count 0', () => {
    // Arrange — same-type stacks across two slots: slot0 full (64), slot1 30.
    // (A same-type add fills the existing partial first, so a spread requires
    // filling one slot to 64 first.)
    const inventory = new Inventory(2);
    inventory.Add(ItemIds.Wood, 64); // slot 0: Wood 64 (full)
    inventory.Add(ItemIds.Wood, 30); // slot 1: Wood 30 (partial)

    // Act — remove 80: slot 0 gives 64 and empties, slot 1 gives 16.
    const result = inventory.Remove(ItemIds.Wood, 80);

    // Assert
    expect(result).toEqual({ removed: 80, missing: 0 });
    const slots = inventory.GetSlots();
    expect(slots[0].itemType).toBeNull();
    expect(slots[0].count).toBe(0);
    expect(slots[1].itemType).toBe(ItemIds.Wood);
    expect(slots[1].count).toBe(14);
  });

  it('INV-12: removal of a missing item type reports everything as missing, slots untouched', () => {
    // Arrange
    const inventory = new Inventory(1);
    inventory.Add(ItemIds.Wood, 5);

    // Act
    const result = inventory.Remove(ItemIds.Stone, 3);

    // Assert
    expect(result).toEqual({ removed: 0, missing: 3 });
    expect(inventory.GetSlots()[0].count).toBe(5);
  });

  it('INV-13: CanAccept sums free capacity across partial and empty slots for the item', () => {
    // Arrange — reachable state: Add(Wood,60) then Add(Wood,4) merges into
    // slot 0 (partials first) → slot0 Wood 64, slot1 Stone 7, slot2 empty.
    const inventory = new Inventory(3);
    inventory.Add(ItemIds.Wood, 60);   // slot 0: Wood partial
    inventory.Add(ItemIds.Stone, 7);   // slot 1: Stone partial
    inventory.Add(ItemIds.Wood, 4);    // slot 0: Wood 64 (fills the partial)

    // Act + Assert — Wood: slot 0 full (0) + empty slot 2 (64) = 64.
    expect(inventory.CanAccept(ItemIds.Wood, 999)).toBe(64);
    // Stone: 57 (slot 1) + 64 (slot 2) = 121.
    expect(inventory.CanAccept(ItemIds.Stone, 999)).toBe(121);
    // Tool: no matching partial, but the empty slot accepts → 64.
    expect(inventory.CanAccept(ItemIds.Tool, 999)).toBe(64);
  });

  it('INV-14: a 0-slot inventory accepts and holds nothing (plant fail-safe)', () => {
    // Arrange
    const inventory = new Inventory(0);

    // Act
    const add = inventory.Add(ItemIds.Wood, 10);
    const remove = inventory.Remove(ItemIds.Wood, 10);

    // Assert
    expect(add).toEqual({ accepted: 0, rejected: 10 });
    expect(remove).toEqual({ removed: 0, missing: 10 });
    expect(inventory.GetSlots()).toEqual([]);
    expect(inventory.slotCount).toBe(0);
  });

  it('INV-15: GetSlots returns a snapshot — mutating it cannot affect internal state', () => {
    // Arrange
    const inventory = new Inventory(1);
    inventory.Add(ItemIds.Wood, 5);

    // Act
    const snapshot = inventory.GetSlots();
    snapshot[0].count = 999;
    snapshot[0].itemType = ItemIds.Crystal;
    snapshot.push({ itemType: null, count: 0 });

    // Assert
    expect(inventory.GetSlots()[0].count).toBe(5);
    expect(inventory.GetSlots()[0].itemType).toBe(ItemIds.Wood);
    expect(inventory.GetSlots()).toHaveLength(1);
  });

  it('INV-16: slot data is plain serializable data — JSON round-trip preserves it (R9)', () => {
    // Arrange
    const inventory = new Inventory(2);
    inventory.Add(ItemIds.Wood, 5);
    inventory.Add(ItemIds.Stone, 30);

    // Act
    const round = JSON.parse(JSON.stringify(inventory.GetSlots()));

    // Assert — plain ids/counts, no Three.js references (phase-2 persistence).
    expect(round).toEqual([
      { itemType: ItemIds.Wood, count: 5 },
      { itemType: ItemIds.Stone, count: 30 },
    ]);
    expect(() => JSON.stringify(inventory.GetSlots())).not.toThrow();
  });
});
