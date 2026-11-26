import { TextureService } from '_services/index';

// CAV-004 T1 (test design 0f67245b): texture naming — the optional
// stateCount generalization must preserve the existing 4-state contract
// (buildings: <Name>0..3.png + <Name>.png) and add the plant contract
// (frame < stateCount -> <Name><frame>.png; frame == stateCount ->
// <Name>.png). Asserted via a boundary double of the loader (TextureService
// itself is on the strategy allow-list).

function makeRecordedService(): { svc: any, requested: string[] } {
  const requested: string[] = [];
  // The class's constructor is private (singleton); reach the real naming
  // logic through the prototype with GetTexture intercepted at the boundary.
  const Svc = TextureService as any;
  const inst = Object.create(Svc.prototype);
  inst.textures = new Map();
  inst.loaded = new Map();
  inst.buildingsMap = 'buildings/';
  inst.bambooMap = 'plants/bamboo/';
  inst.treeMap = 'plants/tree/';
  inst.GetTexture = (name: string) => {
    requested.push(name);
    return { dispose: jest.fn() } as any;
  };
  return { svc: inst, requested };
}

describe('GetBuildingTextureWithState naming (CAV-004 T1)', () => {
  it('default stateCount 4 preserves the existing building behavior', () => {
    // Arrange
    const { svc, requested } = makeRecordedService();

    // Act
    svc.GetBuildingTextureWithState('TinyHouse', 0);
    svc.GetBuildingTextureWithState('TinyHouse', 1);
    svc.GetBuildingTextureWithState('TinyHouse', 2);
    svc.GetBuildingTextureWithState('TinyHouse', 3);
    svc.GetBuildingTextureWithState('TinyHouse', 4);

    // Assert
    expect(requested).toEqual([
      'buildings/TinyHouse0',
      'buildings/TinyHouse1',
      'buildings/TinyHouse2',
      'buildings/TinyHouse3',
      'buildings/TinyHouse',
    ]);
  });

  it('a plant stateCount maps growth frames to <Name><frame>.png and the mature frame to <Name>.png', () => {
    // Arrange — Bamboo: N = 37 states, stateCount = 36;
    // Tree: 15 growth frames plus the mature image, stateCount = 15.
    const { svc, requested } = makeRecordedService();

    // Act
    svc.GetBuildingTextureWithState('Bamboo', 0, 36);
    svc.GetBuildingTextureWithState('Bamboo', 21, 36);
    svc.GetBuildingTextureWithState('Bamboo', 35, 36);
    svc.GetBuildingTextureWithState('Bamboo', 36, 36);
    svc.GetBuildingTextureWithState('Tree', 0, 15);
    svc.GetBuildingTextureWithState('Tree', 14, 15);
    svc.GetBuildingTextureWithState('Tree', 15, 15);

    // Assert
    expect(requested).toEqual([
      'plants/bamboo/Bamboo0',
      'plants/bamboo/Bamboo21',
      'plants/bamboo/Bamboo35',
      'plants/bamboo/Bamboo',
      'plants/tree/Tree0',
      'plants/tree/Tree14',
      'plants/tree/Tree',
    ]);
  });
});
