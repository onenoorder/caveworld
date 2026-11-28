import { ItemIds } from '_utilities/Enums';
import { AddResult, IInventory, RemoveResult, Slot, STACK_SIZE_LIMIT } from './IInventory';

// CAV-022 (architecture D3/D6/D7): slot-rule implementation. Pure TypeScript —
// no Three.js, no services. Every Add returns { accepted, rejected } with
// accepted + rejected === qty: nothing is silently dropped; the
// overflow-vs-reject policy beyond this remainder contract is CAV-020's.
class Inventory implements IInventory {
  readonly slotCount: number;
  private slots: Slot[];

  constructor(slotCount: number) {
    this.slotCount = slotCount;
    this.slots = [];
    for (let i = 0; i < slotCount; i++) {
      this.slots.push({ itemType: null, count: 0 });
    }
  }

  GetSlots(): Slot[] {
    return this.slots.map(slot => ({ itemType: slot.itemType, count: slot.count }));
  }

  CanAccept(item: ItemIds, qty: number): number {
    let capacity = 0;
    for (const slot of this.slots) {
      if (slot.itemType === null) {
        capacity += STACK_SIZE_LIMIT;
      } else if (slot.itemType === item) {
        capacity += STACK_SIZE_LIMIT - slot.count;
      }
    }
    return capacity;
  }

  Add(item: ItemIds, qty: number): AddResult {
    if (qty <= 0) {
      return { accepted: 0, rejected: 0 };
    }

    let remaining = qty;

    // Partial matching slots first (index order) — architecture D6.
    for (const slot of this.slots) {
      if (remaining === 0) {
        break;
      }
      if (slot.itemType === item && slot.count < STACK_SIZE_LIMIT) {
        const room = STACK_SIZE_LIMIT - slot.count;
        const toAdd = Math.min(room, remaining);
        slot.count += toAdd;
        remaining -= toAdd;
      }
    }

    // Then empty slots — a different item type never enters a partial slot.
    for (const slot of this.slots) {
      if (remaining === 0) {
        break;
      }
      if (slot.itemType === null) {
        const toAdd = Math.min(STACK_SIZE_LIMIT, remaining);
        slot.itemType = item;
        slot.count = toAdd;
        remaining -= toAdd;
      }
    }

    return { accepted: qty - remaining, rejected: remaining };
  }

  Remove(item: ItemIds, qty: number): RemoveResult {
    if (qty <= 0) {
      return { removed: 0, missing: 0 };
    }

    let remaining = qty;

    // Decrement across matching slots in index order; a slot's itemType
    // clears only when its count reaches 0 — never implicitly discards a stack.
    for (const slot of this.slots) {
      if (remaining === 0) {
        break;
      }
      if (slot.itemType === item && slot.count > 0) {
        const toRemove = Math.min(slot.count, remaining);
        slot.count -= toRemove;
        remaining -= toRemove;
        if (slot.count === 0) {
          slot.itemType = null;
        }
      }
    }

    return { removed: qty - remaining, missing: remaining };
  }
}

export { Inventory };
