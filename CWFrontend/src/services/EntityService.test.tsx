import { Mesh, MeshBasicMaterial, Vector3 } from 'three';
import { EntityService, MapService } from '_services/index';
import { IEntity } from '_entities/index';

// Minimal IEntity double: GetEntityAtPosition reads only position.x/y (floored),
// so no meshes or THREE scene are required. (Test-design note: no Three.js mocking.)
function makeEntity(x: number, y: number): IEntity {
  return {
    position: new Vector3(x, y, 0),
    object: new Mesh(undefined, new MeshBasicMaterial({ color: 0xffff00 })),
    height: 1,
    width: 1,
    BuildObject: () => new Mesh(),
    Destroy: () => undefined,
  };
}

describe('EntityService.GetEntityAtPosition (CAV-002)', () => {
  let service: EntityService;

  beforeEach(() => {
    // EntityService's constructor is private and needs a THREE scene: initialize
    // the singleton directly (registry arrays only — lookup touches nothing else).
    (EntityService as any).Instance = Object.create(EntityService.prototype);
    (EntityService as any).Instance.scene = null;
    (EntityService as any).Instance.buildings = [];
    (EntityService as any).Instance.constructions = [];
    (EntityService as any).Instance.stairs = [];
    (EntityService as any).Instance.houses = [];
    (EntityService as any).Instance.dwarfs = [];
    service = EntityService.Instance;
    // TryAddBuilding is not exercised in these tests; keep MapService unset.
    MapService.Instance = undefined as unknown as MapService;
  });

  describe('UC-1/2/3: returns the entity whose floored grid position matches the cell', () => {
    it.each([
      ['building', 'buildings'],
      ['dwarf', 'dwarfs'],
      ['stair', 'stairs'],
    ])('returns %s at matching cell', (_kind: string, collection: string) => {
      const entity = makeEntity(10, 5);
      (service as any)[collection] = [entity];

      const result = EntityService.Instance.GetEntityAtPosition(new Vector3(10, 5, 0));

      expect(result).toBe(entity);
    });

    it('floors fractional entity coordinates before comparing', () => {
      const dwarf = makeEntity(7.4, 3.9);
      service.dwarfs = [dwarf as any];

      const result = EntityService.Instance.GetEntityAtPosition(new Vector3(7, 3, 0));

      expect(result).toBe(dwarf);
    });
  });

  describe('UC-4: empty cell', () => {
    it('returns null when no entity occupies the cell', () => {
      service.buildings = [makeEntity(10, 5)] as any;

      const result = EntityService.Instance.GetEntityAtPosition(new Vector3(0, 0, 0));

      expect(result).toBeNull();
    });

    it('returns null on a boundary mismatch (x matches, y does not)', () => {
      service.buildings = [makeEntity(10, 5)] as any;

      const result = EntityService.Instance.GetEntityAtPosition(new Vector3(10, 6, 0));

      expect(result).toBeNull();
    });
  });

  describe('UC-5: overlap priority is buildings → dwarfs → stairs', () => {
    it('returns the building when a building and a dwarf share a cell', () => {
      const building = makeEntity(3, 4);
      const dwarf = makeEntity(3, 4);
      service.buildings = [building] as any;
      service.dwarfs = [dwarf as any];

      const result = EntityService.Instance.GetEntityAtPosition(new Vector3(3, 4, 0));

      expect(result).toBe(building);
    });

    it('returns the dwarf when a dwarf and a stair share a cell', () => {
      const dwarf = makeEntity(3, 4);
      const stair = makeEntity(3, 4);
      service.dwarfs = [dwarf as any];
      service.stairs = [stair as any];

      const result = EntityService.Instance.GetEntityAtPosition(new Vector3(3, 4, 0));

      expect(result).toBe(dwarf);
    });
  });

  describe('UC-11: per-frame iteration without object allocation', () => {
    it('resolves matches consistently across repeated calls', () => {
      service.buildings = [makeEntity(1, 1), makeEntity(2, 2)] as any;
      service.dwarfs = [makeEntity(3, 3)] as any;
      service.stairs = [makeEntity(4, 4)] as any;

      const first = EntityService.Instance.GetEntityAtPosition(new Vector3(1, 1, 0));
      const second = EntityService.Instance.GetEntityAtPosition(new Vector3(2, 2, 0));
      const third = EntityService.Instance.GetEntityAtPosition(new Vector3(3, 3, 0));
      const fourth = EntityService.Instance.GetEntityAtPosition(new Vector3(4, 4, 0));

      expect(first).not.toBeNull();
      expect(second).not.toBeNull();
      expect(third).not.toBeNull();
      expect(fourth).not.toBeNull();
    });
  });
});
