import { IBuilding, Slot } from '_buildings/index';
import { ItemIds } from '_utilities/Enums';

// CAV-022 (architecture D1/D5/D7/D9): inventory controller. Repurposed from
// the dead JobService duplicate (zero callers, verified) — the stale job-queue
// code is deleted. Stateless: every Building owns its inventory; the service
// is the single API surface through which goods move and are read, enforcing
// the built-state gate (state === 4, the GetLimit() precedent — NOT IsBuild(),
// which would permanently lock out MainHouse, born state 4 with buildProgress
// 0). JobService keeps the job queue untouched (Core Architecture decision).
class InventoryService {
  public static Instance: InventoryService;

  private constructor() {
  }

  public static Setup() {
    if (InventoryService.Instance)
      InventoryService.Instance.Destroy();

    InventoryService.Instance = new InventoryService();
  }

  // Adds while state === 4; an unbuilt building exists but accepts nothing.
  Add(building: IBuilding, item: ItemIds, qty: number): { accepted: number; rejected: number } {
    if (building.state < 4) {
      return { accepted: 0, rejected: qty };
    }

    return building.inventory.Add(item, qty);
  }

  // No gate on remove — an unbuilt building never accepted anything, so its
  // stock is empty; removal simply reports everything as missing.
  Remove(building: IBuilding, item: ItemIds, qty: number): { removed: number; missing: number } {
    return building.inventory.Remove(item, qty);
  }

  // Capacity-first: moves min(sourceAvailable, targetCapacity, qty) — remove
  // and add in one step, no rollback path needed. Clamping to the source's
  // availability is what prevents item duplication.
  Transfer(from: IBuilding, to: IBuilding, item: ItemIds, qty: number): { moved: number } {
    const capacity = this.CanAccept(to, item, qty);
    const sourceAvailable = this.Count(from, item);
    const moved = Math.min(qty, capacity, sourceAvailable);
    this.Remove(from, item, moved);
    this.Add(to, item, moved);
    return { moved };
  }

  // Total count of an item currently held by a building (read API).
  Count(building: IBuilding, item: ItemIds): number {
    let total = 0;
    for (const slot of building.inventory.GetSlots()) {
      if (slot.itemType === item) {
        total += slot.count;
      }
    }
    return total;
  }

  // Free capacity for the item (CAV-023 planning query); 0 while unbuilt.
  CanAccept(building: IBuilding, item: ItemIds, qty: number): number {
    if (building.state < 4) {
      return 0;
    }

    return building.inventory.CanAccept(item, qty);
  }

  // Read API for the selection panel (CAV-021) — always works, built or not.
  GetBuildingStock(building: IBuilding): Slot[] {
    return building.inventory.GetSlots();
  }

  Destroy() {
  }
}

export { InventoryService };
