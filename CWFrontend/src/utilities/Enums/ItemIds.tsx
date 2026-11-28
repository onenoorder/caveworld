// CAV-022 (architecture D4): provisional item id taxonomy for the building
// inventory system, beside BuildingIds (same convention, same folder).
// Members: Wood, Stone, Steel, Tool, Cogwheel, Food, Charcoal, Water, Crystal.
// The real goods set is CAV-023/CAV-024 scope — extending this enum later is a
// data change, not a logic change.
export enum ItemIds {
  Wood,
  Stone,
  Steel,
  Tool,
  Cogwheel,
  Food,
  Charcoal,
  Water,
  Crystal
}
