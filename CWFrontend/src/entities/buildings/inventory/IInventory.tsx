import { ItemIds } from '_utilities/Enums';

// CAV-022 (architecture D3): slot model for building inventories.
// One item type per slot; a null itemType with count 0 is an empty slot;
// STACK_SIZE_LIMIT is fixed at 64 per the CAV-020 / epic-brief framing.

export interface Slot {
  itemType: ItemIds | null;
  count: number;
}

export interface AddResult {
  accepted: number;
  rejected: number;
}

export interface RemoveResult {
  removed: number;
  missing: number;
}

export interface TransferResult {
  moved: number;
}

export const STACK_SIZE_LIMIT = 64;

export interface IInventory {
  readonly slotCount: number;

  // Snapshot copy — callers cannot mutate internal state through it.
  GetSlots(): Slot[];

  // Free capacity for the item across partial + empty slots.
  CanAccept(item: ItemIds, qty: number): number;

  Add(item: ItemIds, qty: number): AddResult;
  Remove(item: ItemIds, qty: number): RemoveResult;
}
