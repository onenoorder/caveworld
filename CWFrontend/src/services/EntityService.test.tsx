import { Mesh, MeshBasicMaterial, Vector3 } from 'three';
import { EntityService, JobService, MapService, PlacementService, ScaffoldService, TextureService } from '_services/index';
import { IEntity, Scaffold } from '_entities/index';
import { Stair } from '_entities/Stair';
import { MainHouse, TinyHouse } from '_houses/index';
import { RedDwarf } from '_dwarfs/index';
import { SmallStorageHouse } from '_buildings/storages/index';

function makeIEntityDouble(x: number, y: number): IEntity {
  return {
    position: new Vector3(x, y, 0),
    object: new Mesh(undefined, new MeshBasicMaterial({ color: 0xffff00 })),
    height: 1,
    width: 1,
    BuildObject: () => new Mesh(),
    Destroy: jest.fn(),
  };
}

function makeStair(x: number, y: number): Stair {
  return new Stair(new Vector3(x, y, 0));
}

describe('EntityService (CAV-002)', () => {
  let service: EntityService;

  beforeEach(() => {
    // Real private constructor behind the public Setup seam, with a plain
    // double for the THREE.Scene (only .add/.remove/.clear are ever called).
    EntityService.Setup({ add: jest.fn(), remove: jest.fn(), clear: jest.fn() } as any);
    service = EntityService.Instance;
    ScaffoldService.Setup({ add: jest.fn(), remove: jest.fn() } as any);
    JobService.Setup();
    // TextureService is on the strategy allow-list (texture loading/caching);
    // hand it a boundary double that hands back inert texture stand-ins.
    const fakeTexture = { dispose: jest.fn() } as any;
    (TextureService as any).Instance = {
      Destroy: jest.fn(),
      GetTexture: jest.fn(() => fakeTexture),
      GetBuildingTexture: jest.fn(() => fakeTexture),
      GetBuildingTextureWithState: jest.fn(() => fakeTexture),
      GetScaffoldTexture: jest.fn(() => fakeTexture),
      GetDwarfTexture: jest.fn(() => fakeTexture),
    };
    (PlacementService as any).Instance = { TryPlace: jest.fn() };
    (MapService as any).Instance = {
      width: 240,
      height: 135,
      CanPlace: jest.fn(() => true),
      Build: jest.fn(),
      SetClimbable: jest.fn(),
      Free: jest.fn(),
    } as any;
  });

  describe('GetEntityAtPosition (UC-1..UC-5, UC-11)', () => {
    it('returns the building whose floored grid position matches the cell', () => {
      // Arrange
      const house = new MainHouse(new Vector3(10, 5, 0));

      // Act
      service.TryAddBuilding(house);

      // Assert
      expect(service.GetEntityAtPosition(new Vector3(10, 5, 0))).toBe(house);
    });

    it('returns the dwarf at a matching cell', () => {
      // Arrange
      const dwarf = new RedDwarf(new Vector3(20, 10, 0), null);

      // Act
      service.AddDwarf(dwarf);

      // Assert
      expect(service.GetEntityAtPosition(new Vector3(20, 10, 0))).toBe(dwarf);
    });

    it('returns the stair at a matching cell', () => {
      // Arrange
      const stair = makeStair(30, 15);
      service.stairs.push(stair);

      // Act + Assert
      expect(service.GetEntityAtPosition(new Vector3(30, 15, 0))).toBe(stair);
    });

        it('quantizes fractional dwarf coordinates to the visually occupied cell', () => {
      // Arrange — dwarf sprite spans [7.4, 8.4] x [3.4, 4.4]; round resolves
      // each axis to the cell holding the majority of the sprite.
      const dwarf = new RedDwarf(new Vector3(7.4, 3.4, 0), null);
      service.dwarfs.push(dwarf);

      // Act
      const result = service.GetEntityAtPosition(new Vector3(7, 3, 0));

      // Assert
      expect(result).toBe(dwarf);
    });

    it('returns null when no entity occupies the cell', () => {
      // Arrange
      service.buildings.push(new MainHouse(new Vector3(10, 5, 0)));

      // Act + Assert
      expect(service.GetEntityAtPosition(new Vector3(0, 0, 0))).toBeNull();
    });

        it('returns null on a boundary mismatch (x matches, y is outside the footprint)', () => {
      // Arrange — MainHouse at (10,5) covers y = 5..7; y = 8 is above it.
      service.buildings.push(new MainHouse(new Vector3(10, 5, 0)));

      // Act + Assert
      expect(service.GetEntityAtPosition(new Vector3(10, 8, 0))).toBeNull();
    });

        it('returns the dwarf when a dwarf and a building share a cell (dwarfs render in front)', () => {
      // Arrange
      const house = new MainHouse(new Vector3(3, 4, 0));
      const dwarf = new RedDwarf(new Vector3(3, 4, 0), null);
      service.TryAddBuilding(house);
      service.dwarfs.push(dwarf);

      // Act
      const result = service.GetEntityAtPosition(new Vector3(3, 4, 0));

      // Assert
      expect(result).toBe(dwarf);
    });

        it('returns the dwarf when a dwarf and a stair share a cell', () => {
      // Arrange
      const dwarf = new RedDwarf(new Vector3(3, 4, 0), null);
      const stair = makeStair(3, 4);
      service.dwarfs.push(dwarf);
      service.stairs.push(stair);

      // Act
      const result = service.GetEntityAtPosition(new Vector3(3, 4, 0));

      // Assert
      expect(result).toBe(dwarf);
    });

    it('returns the stair when a stair sits inside a building footprint', () => {
      // Arrange
      const house = new MainHouse(new Vector3(3, 4, 0));
      service.TryAddBuilding(house);
      const stair = makeStair(4, 5);
      service.stairs.push(stair);

      // Act
      const result = service.GetEntityAtPosition(new Vector3(4, 5, 0));

      // Assert
      expect(result).toBe(stair);
    });

    it('matches a building across its whole footprint, not just its origin cell (regression)', () => {
      // Arrange — MainHouse is 3 tall x 4 wide, covering cells (10..13, 5..7).
      const house = new MainHouse(new Vector3(10, 5, 0));
      service.TryAddBuilding(house);

      // Act + Assert — every cell of the footprint resolves to the building.
      for (let x = 10; x <= 13; x++) {
        for (let y = 5; y <= 7; y++) {
          expect(service.GetEntityAtPosition(new Vector3(x, y, 0))).toBe(house);
        }
      }
    });

    it('does not match a building outside its footprint', () => {
      // Arrange — MainHouse covers (10..13, 5..7).
      const house = new MainHouse(new Vector3(10, 5, 0));
      service.TryAddBuilding(house);

      // Act + Assert — cells just outside every edge are empty.
      expect(service.GetEntityAtPosition(new Vector3(9, 5, 0))).toBeNull();
      expect(service.GetEntityAtPosition(new Vector3(14, 5, 0))).toBeNull();
      expect(service.GetEntityAtPosition(new Vector3(10, 4, 0))).toBeNull();
      expect(service.GetEntityAtPosition(new Vector3(10, 8, 0))).toBeNull();
    });

    it('rounds fractional dwarf positions to the cell the dwarf is visually on (regression)', () => {
      // Arrange — a dwarf walking across the boundary of two cells: the sprite
      // spans [7.6, 8.6], so it is mostly on cell 8; floor would wrongly report 7.
      const dwarf = new RedDwarf(new Vector3(7.6, 3.9, 0), null);
      service.dwarfs.push(dwarf);

      // Act + Assert
      expect(service.GetEntityAtPosition(new Vector3(8, 4, 0))).toBe(dwarf);
      expect(service.GetEntityAtPosition(new Vector3(7, 3, 0))).toBeNull();
    });

    it('resolves a dwarf standing in front of a building to the dwarf (regression)', () => {
      // Arrange — the dwarf's cell is also covered by the house footprint;
      // dwarfs render in front, so the dwarf must win the lookup.
      const house = new MainHouse(new Vector3(10, 5, 0));
      service.TryAddBuilding(house);
      const dwarf = new RedDwarf(new Vector3(12, 6, 0), null);
      service.dwarfs.push(dwarf);

      // Act
      const result = service.GetEntityAtPosition(new Vector3(12, 6, 0));

      // Assert
      expect(result).toBe(dwarf);
    });

    it('resolves matches consistently across repeated calls (no per-call allocation behavior)', () => {
      // Arrange
      service.buildings.push(new MainHouse(new Vector3(1, 1, 0)), new MainHouse(new Vector3(2, 2, 0)));
      service.dwarfs.push(new RedDwarf(new Vector3(3, 3, 0), null));
      service.stairs.push(makeStair(4, 4));

      // Act
      const first = service.GetEntityAtPosition(new Vector3(1, 1, 0));
      const second = service.GetEntityAtPosition(new Vector3(2, 2, 0));
      const third = service.GetEntityAtPosition(new Vector3(3, 3, 0));
      const fourth = service.GetEntityAtPosition(new Vector3(4, 4, 0));

      // Assert
      expect(first).not.toBeNull();
      expect(second).not.toBeNull();
      expect(third).not.toBeNull();
      expect(fourth).not.toBeNull();
    });
  });

  describe('TryAddBuilding / AddBuilding / AddConstruction / RemoveConstruction', () => {
    it('TryAddBuilding places the building when the map allows it and registers it for lookup', () => {
      // Arrange
      const house = new MainHouse(new Vector3(10, 10, 0));

      // Act
      const canPlace = service.TryAddBuilding(house);

      // Assert
      expect(canPlace).toBe(true);
      expect(service.buildings).toContain(house);
      expect(service.GetEntityAtPosition(new Vector3(10, 10, 0))).toBe(house);
      expect((MapService as any).Instance.CanPlace).toHaveBeenCalledWith(house.position, 3, 4);
    });

    it('TryAddBuilding rejects the building when the map disallows it', () => {
      // Arrange
      const house = new MainHouse(new Vector3(10, 10, 0));
      (MapService as any).Instance.CanPlace = jest.fn(() => false);

      // Act
      const canPlace = service.TryAddBuilding(house);

      // Assert
      expect(canPlace).toBe(false);
      expect(service.buildings).not.toContain(house);
    });

    it('AddBuilding keeps houses out of the houses registry only when they are not residences', () => {
      // Arrange
      const house = new MainHouse(new Vector3(10, 10, 0));
      service.TryAddBuilding(house);

      // Act + Assert
      expect(service.houses).toContain(house);
    });

    it('AddBuilding registers a non-residence building without touching the houses registry', () => {
      // Arrange
      const house = new MainHouse(new Vector3(10, 10, 0));
      service.TryAddBuilding(house);
      const storage = new SmallStorageHouse(new Vector3(50, 50, 0));

      // Act
      service.AddBuilding(storage);

      // Assert
      expect(service.buildings).toContain(storage);
      expect(service.houses).not.toContain(storage);
    });

    it('AddBuilding beyond the first building creates and registers a construction', () => {
      // Arrange
      service.TryAddBuilding(new MainHouse(new Vector3(10, 10, 0)));

      // Act
      service.AddBuilding(new TinyHouse(new Vector3(20, 20, 0)));

      // Assert
      expect(service.constructions).toHaveLength(1);
      expect(service.constructions[0].position.x).toBe(20);
      expect(service.constructions[0].position.y).toBe(20);
    });

    it('AddConstruction registers the construction and adds its mesh to the scene', () => {
      // Arrange
      service.TryAddBuilding(new MainHouse(new Vector3(10, 10, 0)));
      service.AddBuilding(new TinyHouse(new Vector3(20, 20, 0)));
      const construction = service.constructions[0];
      service.constructions = [];

      // Act
      service.AddConstruction(construction);

      // Assert
      expect(service.constructions).toContain(construction);
    });

    it('RemoveConstruction removes the matching construction only', () => {
      // Arrange
      service.TryAddBuilding(new MainHouse(new Vector3(10, 10, 0)));
      service.AddBuilding(new TinyHouse(new Vector3(20, 20, 0)));
      const construction = service.constructions[0];
      const other = makeIEntityDouble(0, 0) as any;
      service.constructions.push(other);

      // Act
      service.RemoveConstruction(construction);

      // Assert
      expect(service.constructions).not.toContain(construction);
      expect(service.constructions).toContain(other);
    });

    it('RemoveConstruction is a no-op for a construction that is not registered', () => {
      // Arrange
      const foreign = makeIEntityDouble(0, 0) as any;

      // Act
      service.RemoveConstruction(foreign);

      // Assert
      expect(service.constructions).toHaveLength(0);
    });
  });

  describe('AddStair and HasStair (regression: previously always returned false)', () => {
    it('AddStair registers the stair, builds the cell and marks it climbable', () => {
      // Arrange
      const stair = makeStair(12, 8);

      // Act
      service.AddStair(stair);

      // Assert
      expect(service.stairs).toContain(stair);
      expect((MapService as any).Instance.Build).toHaveBeenCalledWith(stair.position, 1, 1);
      expect((MapService as any).Instance.SetClimbable).toHaveBeenCalledWith(stair.position);
    });

    it('HasStair returns true for a registered stair position', () => {
      // Arrange
      const stair = makeStair(12, 8);
      service.AddStair(stair);

      // Act + Assert
      expect(service.HasStair(new Vector3(12, 8, 0))).toBe(true);
    });

    it('HasStair returns false when no stair exists at the position (regression)', () => {
      // Arrange
      service.AddStair(makeStair(12, 8));

      // Act + Assert
      expect(service.HasStair(new Vector3(13, 8, 0))).toBe(false);
    });

    it('HasStair ignores the z coordinate', () => {
      // Arrange
      service.AddStair(makeStair(12, 8));

      // Act + Assert
      expect(service.HasStair(new Vector3(12, 8, 7))).toBe(true);
    });
  });

  describe('AddJob delegates to JobService', () => {
    it('pushes the job into the JobService registry', () => {
      // Arrange
      const job = {
        position: new Vector3(1, 1, 0),
        IsCompleted: () => false,
        IsFull: () => false,
        GetName: () => 'Dig',
      } as any;

      // Act
      service.AddJob(job);

      // Assert
      expect(JobService.Instance.jobs).toContain(job);
    });
  });

  describe('scaffold delegation (scene ops live in ScaffoldService)', () => {
    it('AddScaffold and RemoveScaffold delegate to the ScaffoldService', () => {
      // Arrange
      const scaffold = new Scaffold(new Vector3(5, 5, 0), 6);
      const addScaffold = jest.spyOn(ScaffoldService.Instance, 'AddScaffold').mockImplementation(() => undefined);
      const removeScaffold = jest.spyOn(ScaffoldService.Instance, 'RemoveScaffold').mockImplementation(() => undefined);

      // Act
      service.AddScaffold(scaffold);
      service.RemoveScaffold(scaffold);

      // Assert
      expect(addScaffold).toHaveBeenCalledWith(scaffold);
      expect(removeScaffold).toHaveBeenCalledWith(scaffold);
    });
  });

  describe('Destroy and Tick', () => {
    it('Destroy destroys registered buildings, constructions and dwarfs', () => {
      // Arrange
      const house = new MainHouse(new Vector3(10, 10, 0));
      service.TryAddBuilding(house);
      service.AddBuilding(new TinyHouse(new Vector3(20, 20, 0)));
      const construction = service.constructions[0];
      const constructionDestroy = jest.spyOn(construction, 'Destroy');
      const dwarf = new RedDwarf(new Vector3(1, 1, 0), null);
      const dwarfDestroy = jest.spyOn(dwarf, 'Destroy');
      service.dwarfs.push(dwarf);

      // Act
      service.Destroy();

      // Assert
      expect(constructionDestroy).toHaveBeenCalled();
      expect(dwarfDestroy).toHaveBeenCalled();
    });

    it('Tick ticks buildings, removes completed constructions and ticks dwarfs', () => {
      // Arrange
      const house = new MainHouse(new Vector3(10, 10, 0));
      service.TryAddBuilding(house);
      service.AddBuilding(new TinyHouse(new Vector3(20, 20, 0)));
      const construction = service.constructions[0];
      const dwarf = new RedDwarf(new Vector3(1, 1, 0), null);
      service.dwarfs.push(dwarf);
      const constructionTick = jest.spyOn(construction, 'Tick');
      // RedDwarf.Tick drives the full goal stack (LifeGoal → jobs → goals that
      // need the live map graph); stub at the Dwarf boundary — the registry
      // behavior under test is that dwarfs in the list get ticked.
      const dwarfTick = jest.spyOn(dwarf, 'Tick').mockImplementation(() => new Vector3());
      jest.spyOn(construction, 'IsCompleted').mockReturnValue(true);

      // Act
      service.Tick(0.016);

      // Assert
      expect(constructionTick).toHaveBeenCalledWith(0.016);
      expect(service.constructions).not.toContain(construction);
      expect(dwarfTick).toHaveBeenCalledWith(0.016);
    });
  });
});
