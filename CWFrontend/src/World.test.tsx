import { Mesh, MeshBasicMaterial, PerspectiveCamera, Vector3 } from 'three';
import World from './World';
import WorldRuntime from './WorldRuntime';
import { EntityService, InteractiontService, JobService, MapService, PlacementService, TextureService } from '_services/index';
import { IEntity } from '_entities/index';
import { MainHouse } from '_houses/index';

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
    Destroy: jest.fn(),
  };
}

// A real MainHouse (no BuildObject call — TryAddBuilding is not part of boot)
// so SpawnService receives a genuine door position.
function makeMainHouse(): MainHouse {
  return new MainHouse(new Vector3(100, 60, 0));
}

// The WebGL/texture bootstrap shell is excluded from the coverage gate per the
// test strategy (jsdom has no WebGL and the cave/atlas compositors are
// engine-facing). Mock OUR OWN shell at that boundary — never Three.js itself —
// and hand it doubles for the renderer and scene it would normally own.
jest.mock('./WorldRuntime', () => ({ __esModule: true, default: jest.fn() }));

function setupWorldServices(): { sceneAdds: any[]; sceneRemoves: any[]; mapFree: jest.Mock; mapTick: jest.Mock; renderer: any } {
  // Real service singletons over boundary doubles. MapService.CanPlace returns
  // true so boot's TryAddBuilding places the MainHouse without a buildable grid.
  (MapService as any).Instance = {
    width: 240,
    height: 135,
    Free: jest.fn(),
    Tick: jest.fn(),
    Build: jest.fn(),
    CanPlace: jest.fn(() => true),
    SetClimbable: jest.fn(),
    Destroy: jest.fn(),
  };
  (TextureService as any).Instance = { Destroy: jest.fn() };
  (InteractiontService as any).Instance = { Destroy: jest.fn() };
  (JobService as any).Setup();
  (PlacementService as any).Instance = { Destroy: jest.fn(), SetPosition: jest.fn() };

  const sceneAdds: any[] = [];
  const sceneRemoves: any[] = [];
  const scene = { add: (o: any) => sceneAdds.push(o), remove: (o: any) => sceneRemoves.push(o), clear: jest.fn() };
  EntityService.Setup(scene as any);

  const renderer = {
    domElement: { addEventListener: jest.fn() },
    clear: jest.fn(),
    dispose: jest.fn(),
    setAnimationLoop: jest.fn(),
    render: jest.fn(),
    setSize: jest.fn(),
  };

  // Seed the WorldRuntime shell mock with the runtime pieces World consumes.
  const mockedRuntime = WorldRuntime as jest.Mock;
  mockedRuntime.mockImplementation(() => ({
    renderer,
    scene,
    camera: new PerspectiveCamera(100, 800 / 600, 1, 10000),
    mainHouse: makeMainHouse(),
  }));

  return { sceneAdds, sceneRemoves, mapFree: (MapService as any).Instance.Free, mapTick: (MapService as any).Instance.Tick, renderer };
}

function makeWorld(): { world: World; sceneAdds: any[]; sceneRemoves: any[]; mapTick: jest.Mock; renderer: any } {
  const setup = setupWorldServices();
  const container = { offsetWidth: 800, offsetHeight: 600, append: jest.fn(), addEventListener: jest.fn(), removeEventListener: jest.fn() };
  const world = new World(container);
  return { world, sceneAdds: setup.sceneAdds, sceneRemoves: setup.sceneRemoves, mapTick: setup.mapTick, renderer: setup.renderer };
}

describe('World (CAV-002)', () => {
  beforeEach(() => {
    (WorldRuntime as jest.Mock).mockClear();
  });

  describe('boot', () => {
    it('constructs via the runtime shell and registers the hover debug hook', () => {
      // Arrange + Act
      const { world, renderer } = makeWorld();

      // Assert
      expect(world.renderer).toBe(renderer);
      expect((window as any).__cw.world).toBe(world);
      expect(world.selectedEntity).toBeNull();
      expect(world.selectedEntityOriginalColor).toBeNull();
      expect(world.camera.position.x).toBe(103);
      expect(world.camera.position.y).toBe(63);
      expect(world.camera.position.z).toBe(10);
      expect(world.userInput).toBeDefined();
      expect(world.spawnService).toBeDefined();
    });

    it('destroy tears down services and the renderer exactly once per resource', () => {
      // Arrange
      const { world, renderer } = makeWorld();
      EntityService.Instance.AddDwarf(makeEntity(1, 1, 0xffffff) as unknown as Parameters<typeof EntityService.Instance.AddDwarf>[0]);

      // Act
      world.destroy();

      // Assert
      expect((TextureService as any).Instance.Destroy).toHaveBeenCalled();
      expect((MapService as any).Instance.Destroy).toHaveBeenCalled();
      expect((PlacementService as any).Instance.Destroy).toHaveBeenCalled();
      expect(renderer.dispose).toHaveBeenCalled();
      expect(renderer.clear).toHaveBeenCalled();
      expect(EntityService.Instance.dwarfs[0].Destroy).toHaveBeenCalled();
    });

    it('render loops tick + renderer.render, and start/stop control the animation loop', () => {
      // Arrange
      const { world, renderer } = makeWorld();
      EntityService.Instance.Tick = jest.fn();
      (PlacementService as any).Instance.SetPosition = jest.fn();

      // Act
      world.render();
      world.start();
      const loop = renderer.setAnimationLoop.mock.calls[0][0];
      loop();
      world.stop();

      // Assert
      expect((PlacementService as any).Instance.SetPosition).toHaveBeenCalledWith(world.userInput.selectedCell);
      expect(EntityService.Instance.Tick).toHaveBeenCalled();
      expect(renderer.render).toHaveBeenCalledWith(world.scene, world.camera);
      expect(renderer.setAnimationLoop).toHaveBeenLastCalledWith(null);
    });
  });

  describe('UC-6: applies quarry-blue to the hovered entity', () => {
    it.each([
      ['building', 'buildings', 0xffff00],
      ['dwarf', 'dwarfs', 0xffffff],
      ['stair', 'stairs', 0xffffff],
    ])('highlights a hovered %s', (_kind: string, collection: string, baseColor: number) => {
      // Arrange
      const { world } = makeWorld();
      const entity = makeEntity(5, 5, baseColor);
      (EntityService.Instance as any)[collection] = [entity];
      world.userInput.selectedCell.set(5, 5, 0);
      (world.userInput.mouse as any).isMouseOver = true;

      // Act
      world.updateHover();

      // Assert
      expect((entity.object.material as MeshBasicMaterial).color.getHex()).toBe(HIGHLIGHT_COLOR);
    });
  });

  describe('UC-7: reverts the previous entity when the hover target changes', () => {
    it('restores the previous entity and highlights the new one', () => {
      // Arrange
      const { world } = makeWorld();
      const building = makeEntity(1, 1, 0xffff00);
      const dwarf = makeEntity(2, 2, 0xffffff);
      EntityService.Instance.buildings = [building] as any;
      EntityService.Instance.dwarfs = [dwarf as any];
      world.userInput.selectedCell.set(1, 1, 0);
      (world.userInput.mouse as any).isMouseOver = true;

      // Act
      world.updateHover();
      world.userInput.selectedCell.set(2, 2, 0);
      world.updateHover();

      // Assert
      const buildingColor = (building.object.material as MeshBasicMaterial).color.getHex();
      const dwarfColor = (dwarf.object.material as MeshBasicMaterial).color.getHex();
      expect(buildingColor).toBe(0xffff00);
      expect(dwarfColor).toBe(HIGHLIGHT_COLOR);
      expect(world.selectedEntity).toBe(dwarf);
    });
  });

  describe('UC-8: reverts on empty cell / mouse-leave', () => {
    it('reverts the highlight when the cursor moves to an empty cell', () => {
      // Arrange
      const { world } = makeWorld();
      const entity = makeEntity(5, 5, 0xffff00);
      EntityService.Instance.buildings = [entity] as any;
      world.userInput.selectedCell.set(5, 5, 0);
      (world.userInput.mouse as any).isMouseOver = true;

      // Act
      world.updateHover();
      world.userInput.selectedCell.set(9, 9, 0);
      world.updateHover();

      // Assert
      expect((entity.object.material as MeshBasicMaterial).color.getHex()).toBe(0xffff00);
      expect(world.selectedEntity).toBeNull();
    });

    it('reverts the highlight when the mouse leaves the canvas', () => {
      // Arrange
      const { world } = makeWorld();
      const entity = makeEntity(5, 5, 0xffffff);
      EntityService.Instance.buildings = [entity] as any;
      world.userInput.selectedCell.set(5, 5, 0);
      (world.userInput.mouse as any).isMouseOver = true;

      // Act
      world.updateHover();
      (world.userInput.mouse as any).isMouseOver = false;
      world.updateHover();

      // Assert
      expect((entity.object.material as MeshBasicMaterial).color.getHex()).toBe(0xffffff);
      expect(world.selectedEntity).toBeNull();
    });
  });

  describe('UC-9: first hover (selectedEntity starts null)', () => {
    it('highlights without errors when nothing was hovered before', () => {
      // Arrange
      const { world } = makeWorld();
      const entity = makeEntity(5, 5, 0xffff00);
      EntityService.Instance.buildings = [entity] as any;
      world.userInput.selectedCell.set(5, 5, 0);
      (world.userInput.mouse as any).isMouseOver = true;

      // Act + Assert
      expect(() => world.updateHover()).not.toThrow();
      expect((entity.object.material as MeshBasicMaterial).color.getHex()).toBe(HIGHLIGHT_COLOR);
    });
  });

  describe('UC-10: hover detection is read-only toward positions and game logic', () => {
    it('runs from the tick loop after placement and before entity ticking', () => {
      // Arrange
      const { world, mapTick } = makeWorld();
      const entity = makeEntity(5, 5, 0xffff00);
      EntityService.Instance.buildings = [entity] as any;
      EntityService.Instance.Tick = jest.fn();
      const updateHoverSpy = jest.spyOn(world, 'updateHover');
      world.userInput.selectedCell.set(5, 5, 0);
      (world.userInput.mouse as any).isMouseOver = true;

      // Act
      world.tick();

      // Assert
      expect((PlacementService as any).Instance.SetPosition).toHaveBeenCalledWith(world.userInput.selectedCell);
      expect(updateHoverSpy).toHaveBeenCalledTimes(1);
      expect(EntityService.Instance.Tick).toHaveBeenCalled();
      expect(mapTick).toHaveBeenCalled();
      // Hover outcome flows through the real updateHover: entity is highlighted.
      expect((entity.object.material as MeshBasicMaterial).color.getHex()).toBe(HIGHLIGHT_COLOR);
      expect(world.selectedEntity).toBe(entity);
    });

    it('does not modify entity positions', () => {
      // Arrange
      const { world } = makeWorld();
      const entity = makeEntity(5, 5, 0xffff00);
      EntityService.Instance.buildings = [entity] as any;
      world.userInput.selectedCell.set(5, 5, 0);
      (world.userInput.mouse as any).isMouseOver = true;

      // Act
      world.updateHover();

      // Assert
      expect(entity.position.x).toBe(5);
      expect(entity.position.y).toBe(5);
      expect(entity.position.z).toBe(0);
    });

    it('keeps its own hover state when the same cell is re-checked', () => {
      // Arrange
      const { world } = makeWorld();
      const entity = makeEntity(5, 5, 0xffff00);
      EntityService.Instance.buildings = [entity] as any;
      world.userInput.selectedCell.set(5, 5, 0);
      (world.userInput.mouse as any).isMouseOver = true;

      // Act
      world.updateHover();
      world.updateHover();

      // Assert
      expect((entity.object.material as MeshBasicMaterial).color.getHex()).toBe(HIGHLIGHT_COLOR);
      expect(world.selectedEntity).toBe(entity);
    });
  });
});
