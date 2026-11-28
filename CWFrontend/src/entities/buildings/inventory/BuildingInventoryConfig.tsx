// CAV-022 (architecture D2): per-building-type slot counts. Plain data keyed
// by the construction-type names the concrete constructors pass via super()
// ('TinyHouse', 'Woodworks', ...). Changing a number is a data edit — no logic
// change (AC-2). Product-approved numbers are follow-up stories; these values
// are provisional.

// The 19 construction catalogue names (plants are deliberately absent).
export type InventoryBuildingName =
  'MainHouse' | 'TinyHouse' | 'SmallHouse' | 'MediumHouse' | 'BigHouse' | 'HugeHouse'
  | 'SmallStorageHouse' | 'MediumStorageHouse' | 'BigStorageHouse'
  | 'Woodworks' | 'Stoneworks' | 'Steelworks' | 'Waterworks' | 'ToolFactory'
  | 'CogwheelFactory' | 'FoodFactory' | 'CharcoalBurner' | 'Laboratory' | 'CrystalLoadingstation';

export const BUILDING_SLOT_COUNTS: Record<InventoryBuildingName, number> = {
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

// Unknown name (plants, future unconfigured types) resolves to 0 slots —
// fail-safe: the building exists but can never hold stock.
export function GetSlotCount(name: string): number {
  const counts: Record<string, number> = BUILDING_SLOT_COUNTS;
  return counts[name] || 0;
}
