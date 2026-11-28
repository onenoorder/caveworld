export type { IBuilding } from './IBuilding';
export type { IPlant } from './IPlant';
export { Building } from './Building';
export { Plant, GROWTH_FRAME_SECONDS, SEED_ROLL_SECONDS } from './Plant';
export type { SeedCellSource } from './Plant';
export { Bamboo } from './Bamboo';
export { Tree } from './Tree';
// CAV-022: inventory domain module — re-exported for external consumers
// (InventoryService, tests). Building.tsx imports it relatively, never through
// this barrel (architecture import-direction rules).
export * from './inventory/IInventory';
export * from './inventory/Inventory';
export * from './inventory/BuildingInventoryConfig';
export * from './houses';
export * from './storages';
export * from './factories';