import { Mesh, MeshBasicMaterial, Vector3 } from 'three';
import World from './World';
import { EntityService, MapService, PlacementService } from '_services/index';
import { IEntity } from '_entities/index';

const HIGHLIGHT_COLOR = 0x3a6a8a; // quarry-blue per Style Guide

// Minimal IEntity double whose object carries a real MeshBasicMaterial, so the
// highlight/revert logic under test is exercised against real THREE colors.
function makeEntity(x: number, y: number, color: number): IEntity {
  return {
    position: new Vector3(x, y, 0),
    object: new Mesh(undefined, new MeshBasicMaterial({ color })),
    height: 1,
    width: 1,
    BuildObject: () => new Mesh(),
    Destroy: () => undefined,
  };
}

// World's constructor boots the full game stack (WebGL renderer, Map/Cave build),
// which cannot run under jsdom — and Three.js rendering is excluded from unit
// coverage per the Quality & Test Strategy. Build the instance via the prototype
// so updateHover/clearHover run against the real methods under test.
function makeWorld(selectedCell: Vector3, isMouseOver: boolean) {
  const world = Object.create(World.prototype) as World;
  (world as any).selectedEntity = null;
  (world as any).selectedEntityOriginalColor = null;
  (world as any).userInput = {
    selectedCell,
    movement: new Vector3(0, 0, 0),
    cameraSpeedAtZoomLevel: 1,
    mouse: { isMouseOver },
  };
  return world;
}

// Real EntityService singleton with registry arrays only (private constructor
// requires a THREE scene; lookup and Tick are registry-scoped).
function setupEntityService() {
  (EntityService as any).Instance = Object.create(EntityService.prototype);
  (EntityService as any).Instance.scene = null;
  (EntityService as any).Instance.buildings = [];
  (EntityService as any).Instance.constructions = [];
  (EntityService as any).Instance.stairs = [];
  (EntityService as any).Instance.houses = [];
  (EntityService as any).Instance.dwarfs = [];
  return EntityService.Instance;
}

describe('World hover highlight (CAV-002)', () => {
  let service: EntityService;

  beforeEach(() => {
    service = setupEntityService();
  });

  describe('UC-6: applies quarry-blue to the hovered entity', () => {
    it.each([
      ['building', 'buildings', 0xffff00],
      ['dwarf', 'dwarfs', 0xffffff],
      ['stair', 'stairs', 0xffffff],
    ])('highlights a hovered %s', (_kind: string, collection: string, baseColor: number) => {
      const entity = makeEntity(5, 5, baseColor);
      (service as any)[collection] = [entity];
      const world = makeWorld(new Vector3(5, 5, 0), true);

      world['updateHover']();

      expect((entity.object.material as MeshBasicMaterial).color.getHex()).toBe(HIGHLIGHT_COLOR);
    });
  });

  describe('UC-7: reverts the previous entity when the hover target changes', () => {
    it('restores the previous entity and highlights the new one', () => {
      const building = makeEntity(1, 1, 0xffff00);
      const dwarf = makeEntity(2, 2, 0xffffff);
      service.buildings = [building] as any;
      service.dwarfs = [dwarf as any];
      const selectedCell = new Vector3(1, 1, 0);
      const world = makeWorld(selectedCell, true);

      world['updateHover']();
      selectedCell.set(2, 2, 0);
      world['updateHover']();

      const buildingColor = (building.object.material as MeshBasicMaterial).color.getHex();
      const dwarfColor = (dwarf.object.material as MeshBasicMaterial).color.getHex();
      expect(buildingColor).toBe(0xffff00);
      expect(dwarfColor).toBe(HIGHLIGHT_COLOR);
      expect((world as any).selectedEntity).toBe(dwarf);
    });
  });

  describe('UC-8: reverts on empty cell / mouse-leave', () => {
    it('reverts the highlight when the cursor moves to an empty cell', () => {
      const entity = makeEntity(5, 5, 0xffff00);
      service.buildings = [entity] as any;
      const selectedCell = new Vector3(5, 5, 0);
      const world = makeWorld(selectedCell, true);

      world['updateHover']();
      selectedCell.set(9, 9, 0);
      world['updateHover']();

      expect((entity.object.material as MeshBasicMaterial).color.getHex()).toBe(0xffff00);
      expect((world as any).selectedEntity).toBeNull();
    });

    it('reverts the highlight when the mouse leaves the canvas', () => {
      const entity = makeEntity(5, 5, 0xffffff);
      service.buildings = [entity] as any;
      const selectedCell = new Vector3(5, 5, 0);
      const world = makeWorld(selectedCell, true);

      world['updateHover']();
      (world as any).userInput.mouse.isMouseOver = false;
      world['updateHover']();

      expect((entity.object.material as MeshBasicMaterial).color.getHex()).toBe(0xffffff);
      expect((world as any).selectedEntity).toBeNull();
    });
  });

  describe('UC-9: first hover (selectedEntity starts null)', () => {
    it('highlights without errors when nothing was hovered before', () => {
      const entity = makeEntity(5, 5, 0xffff00);
      service.buildings = [entity] as any;
      const world = makeWorld(new Vector3(5, 5, 0), true);

      expect(() => world['updateHover']()).not.toThrow();
      expect((entity.object.material as MeshBasicMaterial).color.getHex()).toBe(HIGHLIGHT_COLOR);
    });
  });

  describe('UC-10: hover detection is read-only toward positions and game logic', () => {
    it('runs from the tick loop after placement and before entity ticking', () => {
      const entity = makeEntity(5, 5, 0xffff00);
      service.buildings = [entity] as any;
      const world = makeWorld(new Vector3(5, 5, 0), true) as any;
      world.clock = { getDelta: () => 0.016 };
      world.camera = { position: new Vector3() };
      world.spawnService = { Tick: jest.fn() };
      const mapTick = jest.fn();
      const placementSetPosition = jest.fn();
      const entityTick = jest.fn();
      (MapService as any).Instance = { Tick: mapTick };
      (PlacementService as any).Instance = { SetPosition: placementSetPosition };
      EntityService.Instance.Tick = entityTick;
      const updateHoverSpy = jest.spyOn(world, 'updateHover');

      World.prototype.tick.call(world);

      expect(placementSetPosition).toHaveBeenCalledWith(world.userInput.selectedCell);
      expect(updateHoverSpy).toHaveBeenCalledTimes(1);
      expect(entityTick).toHaveBeenCalled();
      expect(mapTick).toHaveBeenCalled();
      // Hover outcome flows through the real updateHover: entity is highlighted.
      expect((entity.object.material as MeshBasicMaterial).color.getHex()).toBe(HIGHLIGHT_COLOR);
      expect(world.selectedEntity).toBe(entity);
    });

    it('does not modify entity positions', () => {
      const entity = makeEntity(5, 5, 0xffff00);
      service.buildings = [entity] as any;
      const world = makeWorld(new Vector3(5, 5, 0), true);

      world['updateHover']();

      expect(entity.position.x).toBe(5);
      expect(entity.position.y).toBe(5);
      expect(entity.position.z).toBe(0);
    });

    it('keeps its own hover state when the same cell is re-checked', () => {
      const entity = makeEntity(5, 5, 0xffff00);
      service.buildings = [entity] as any;
      const world = makeWorld(new Vector3(5, 5, 0), true);

      world['updateHover']();
      world['updateHover']();

      expect((entity.object.material as MeshBasicMaterial).color.getHex()).toBe(HIGHLIGHT_COLOR);
      expect((world as any).selectedEntity).toBe(entity);
    });
  });
});
