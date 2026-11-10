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
    // Arrange — Bamboo: N = 39 measured frames, stateCount = N - 1 = 38;
    // Tree: N = 18, stateCount = 17.
    const { svc, requested } = makeRecordedService();

    // Act
    svc.GetBuildingTextureWithState('Bamboo', 0, 38);
    svc.GetBuildingTextureWithState('Bamboo', 21, 38);
    svc.GetBuildingTextureWithState('Bamboo', 37, 38);
    svc.GetBuildingTextureWithState('Bamboo', 38, 38);
    svc.GetBuildingTextureWithState('Tree', 17, 17);

    // Assert
    expect(requested).toEqual([
      'buildings/Bamboo0',
      'buildings/Bamboo21',
      'buildings/Bamboo37',
      'buildings/Bamboo',
      'buildings/Tree',
    ]);
  });
});
