// Jest configuration for the Caveworld unit-test gate (Quality & Test Strategy
// bd53db55, "Coverage gate"). The strategy's end-state is 100% lines + 100%
// methods on ALL TypeScript under CWFrontend/src; the codebase has not been
// brought up to that bar yet (the strategy itself stages this: IdleJob must be
// wired/removed "before the coverage gate is tightened"). This config enforces
// the strategy gate on the files the gate currently covers — every file
// touched by a story must reach the bar — via a global threshold that applies
// to everything collected:
//
//   - lines: 100 + statements: 100  → the strategy's "100% lines"
//   - functions: 100                → the strategy's "100% methods" (Jest's
//                                     Istanbul names the metric "functions";
//                                     class methods and arrow-function fields
//                                     both count as functions)
//
// collectCoverageFrom therefore collects ONLY the files the gate protects
// (everything else would dilute the ratchet and defeat the hard-fail). Files
// leave the "ungated" pool only by being changed + tested to the bar; the
// pool itself never contains allow-listed Three.js/WebGL wrappers.
//
// The gate is hard: a miss fails the test run ("coverage threshold not met").
// Branches are reported but not gated, per the strategy's Assumptions.
module.exports = {
  testMatch: ['**/__tests__/**/*.{js,jsx,ts,tsx}', '**/*.{spec,test}.{js,jsx,ts,tsx}'],
  collectCoverageFrom: [
    // Gated files (CAV-002): 100% lines + methods required, hard fail.
    'src/World.tsx',
    'src/services/EntityService.tsx',
    'src/controls/Mouse.tsx',
    // Gated files (CAV-003, tier 1 — pure data structures, no WebGL):
    // the ratchet widens from 3 files toward all of src/, starting with the
    // utilities named by the story's task decomposition.
    'src/utilities/Stack/Stack.tsx',
    'src/utilities/Queue/Queue.tsx',
    'src/utilities/Graph/Graph.tsx',
    'src/utilities/Graph/GraphNode.tsx',
    // Gated files (CAV-022, inventory story): the domain module, the attach
    // point, the service, the pure-type contract, and the barrels this story
    // creates or touches (test design §6). Zero-countable-statement files
    // (barrels, the ItemIds enum, IBuilding.tsx, IInventory.tsx) carry empty
    // Istanbul counters: they join the pool, appear as 0% rows, and contribute
    // 0/0 counters — they cannot fail the global thresholds. Their gate is
    // compile-time (tsc strict) + the re-export/enum-member tests.
    'src/utilities/Enums/ItemIds.tsx',
    'src/entities/buildings/inventory/IInventory.tsx',
    'src/entities/buildings/inventory/Inventory.tsx',
    'src/entities/buildings/inventory/BuildingInventoryConfig.tsx',
    'src/entities/buildings/Building.tsx',
    'src/entities/buildings/IBuilding.tsx',
    'src/entities/buildings/index.ts',
    'src/services/InventoryService.tsx',
    'src/services/index.ts',
    // Test-strategy allow-list: excluded from the gate entirely.
    '!src/services/TextureService.tsx',
    '!src/entities/Cave.tsx',
    '!src/entities/Map.tsx',
    // Same-family Three.js/WebGL bootstrap shell + scene-only scaffold
    // orchestration added by CAV-002 (per strategy: new Three.js wrappers
    // join the allow-list in the same PR).
    '!src/WorldRuntime.tsx',
    '!src/services/ScaffoldService.tsx',
    '!src/**/*.d.ts',
  ],
  coverageThreshold: {
    global: {
      lines: 100,
      statements: 100,
      functions: 100,
    },
  },
  moduleNameMapper: {
    '^_controls/(.*)$': '<rootDir>/src/controls/$1',
    '^_utilities/(.*)$': '<rootDir>/src/utilities/$1',
    '^_services/(.*)$': '<rootDir>/src/services/$1',
    '^_entities/(.*)$': '<rootDir>/src/entities/$1',
    '^_buildings/(.*)$': '<rootDir>/src/entities/buildings/$1',
    '^_houses/(.*)$': '<rootDir>/src/entities/buildings/houses/$1',
    '^_storages/(.*)$': '<rootDir>/src/entities/buildings/storages/$1',
    '^_dwarfs/(.*)$': '<rootDir>/src/entities/dwarfs/$1',
    '^_constructions/(.*)$': '<rootDir>/src/entities/constructions/$1',
    '^_jobs/(.*)$': '<rootDir>/src/jobs/$1',
    '^_tasks/(.*)$': '<rootDir>/src/tasks/$1',
    '^_factories/(.*)$': '<rootDir>/src/factories/$1',
    '^_behaviors/(.*)$': '<rootDir>/src/behaviors/$1',
    '^_goals/(.*)$': '<rootDir>/src/goals/$1',
  },
};
