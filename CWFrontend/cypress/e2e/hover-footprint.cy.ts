import { hoverCell, leaveCanvas, entityAt } from '../support/e2e';

// CAV-002 feedback follow-up: hover hitboxes must match what the player sees.
//   1. A dwarf standing in front of a building must be the hover target —
//      dwarfs render in front of buildings (renderOrder 999, depthTest off).
//   2. The dwarf hitbox must track the visible dwarf: dwarfs move on
//      fractional positions while their sprite spans exactly [p, p+1].
//   3. A building must be hoverable across its whole footprint (width x
//      height), not only its origin (left) corner.
//
// MainHouse is placed by boot at map centre (117, 64), 3 tall x 4 wide →
// footprint cells x 117..120, y 64..66. All materials are white tints over
// textures — the revert target is MeshBasicMaterial's default white.
const HIGHLIGHT_COLOR = 0x3a6a8a;
const HOUSE_BASE_COLOR = 0xffffff;
const HOUSE_X = 117;
const HOUSE_Y = 64;
// On-screen empty ground clear of the house footprint.
const EMPTY_CELL = { x: HOUSE_X + 10, y: HOUSE_Y + 5 };

// The boot sequence spawns a dwarf at the house door (118.5/64, inside the
// footprint) and SpawnService keeps respawning there every 30s of game time.
// Idle dwarfs wander along their spawn row, so both would collide with the
// hovered cells. Clear every dwarf and freeze the spawner for deterministic
// assertions (the world keeps running — hover applies per animation frame).
function clearDwarfs(win: any) {
  const service = win.__cw.services.EntityService.Instance;
  service.dwarfs.forEach((d: any) => win.__cw.world.scene.remove(d.object));
  service.dwarfs = [];
  // Tick() spawns when status > 30; park it deep in the past so no respawn
  // can occur while the spec is running.
  win.__cw.world.spawnService.status = -1000000;
}

// Seeded dwarfs idle by seeking a new point of interest; to keep the specs
// deterministic we freeze the simulation loop while seeding (stopping the
// world also stops dwarf movement), then apply the hover state with a single
// explicit tick — hover is applied inside World.tick()/updateHover().
function seedDwarfAt(x: number, y: number) {
  let dwarf: any = null;
  cy.window().then((win: any) => {
    win.__cw.world.stop();
    clearDwarfs(win);
    dwarf = win.__cw.helpers.addDwarf(x, y);
  });
  return () => dwarf;
}

// Apply the hover state for the currently selected cell exactly once.
function applyHoverTick() {
  cy.window().then((win: any) => win.__cw.world.tick());
}

// IT-7: Building hoverable across its full footprint (feedback item 3)
describe('IT-7: a building is hoverable across its whole footprint, not just its corner', () => {
  it('highlights the main house from every footprint cell and reverts on leave', () => {
    cy.visit('/');

    // Arrange: remove the boot-spawned dwarf (it spawns at the house door,
    // 118.5/64, i.e. inside the footprint, and dwarfs win the cell lookup).
    cy.window().then((win: any) => clearDwarfs(win));

    // Sanity: the boot-placed house occupies 117..120 x 64..66.
    entityAt(HOUSE_X, HOUSE_Y).should('not.be.null');

    // Act + Assert: every footprint cell resolves to the house and highlights
    // it — including cells far from the origin corner (the reported bug).
    for (let x = HOUSE_X; x <= HOUSE_X + 3; x++) {
      for (let y = HOUSE_Y; y <= HOUSE_Y + 2; y++) {
        hoverCell(x, y);
        cy.window().should((win: any) => {
          const service = win.__cw.services.EntityService.Instance;
          const house = service.GetEntityAtPosition({ x, y, z: 0 });
          expect(house, `cell (${x},${y}) resolves to the house`).to.eq(win.__cw.world.runtime.mainHouse);
          expect((win.__cw.world.runtime.mainHouse.object.material as any).color.getHex()).to.eq(HIGHLIGHT_COLOR);
          expect(win.__cw.world.selectedEntity).to.eq(win.__cw.world.runtime.mainHouse);
        });
      }
    }

    // Act: move to empty ground.
    hoverCell(EMPTY_CELL.x, EMPTY_CELL.y);

    // Assert: reverted to the original tint.
    cy.window().should((win: any) => {
      expect((win.__cw.world.runtime.mainHouse.object.material as any).color.getHex()).to.eq(HOUSE_BASE_COLOR);
      expect(win.__cw.world.selectedEntity).to.be.null;
    });
  });

  it('still highlights the house when hovering only the footprint centre cell', () => {
    cy.visit('/');

    // Arrange: clear the boot dwarf (its cell, 119/64, is a footprint cell).
    cy.window().then((win: any) => clearDwarfs(win));

    // Act: hover a single interior cell that is NOT the origin corner.
    hoverCell(HOUSE_X + 2, HOUSE_Y + 1);

    // Assert: highlighted while hovered (retries until the frame applies it).
    cy.window().should((win: any) => {
      expect((win.__cw.world.runtime.mainHouse.object.material as any).color.getHex()).to.eq(HIGHLIGHT_COLOR);
      expect(win.__cw.world.selectedEntity).to.eq(win.__cw.world.runtime.mainHouse);
    });

    // Act: leave the canvas.
    leaveCanvas();

    // Assert.
    cy.window().should((win: any) => {
      expect((win.__cw.world.runtime.mainHouse.object.material as any).color.getHex()).to.eq(HOUSE_BASE_COLOR);
      expect(win.__cw.world.selectedEntity).to.be.null;
    });
  });
});

// IT-8: Dwarf in front of a building wins the cell (feedback item 1)
describe('IT-8: a dwarf standing in front of a building is hoverable', () => {
  it('highlights the dwarf over the house while the dwarf occupies a footprint cell', () => {
    cy.visit('/');

    // Arrange: seed a dwarf INSIDE the house footprint (on-screen, in front of
    // the building). Remove the boot dwarf so the seeded one is unambiguous
    // (seedDwarfAt stops the world loop and clears the rest itself).
    const DWARF_CELL = { x: HOUSE_X + 2, y: HOUSE_Y + 1 };
    const getDwarf = seedDwarfAt(DWARF_CELL.x, DWARF_CELL.y);

    // Act: hover the cell both entities occupy (house footprint + dwarf).
    hoverCell(DWARF_CELL.x, DWARF_CELL.y);
    applyHoverTick();

    // Assert: the dwarf (rendered in front) is the hover target, not the house.
    cy.window().should((win: any) => {
      const dwarf = getDwarf();
      expect(dwarf, 'seeded dwarf present').to.not.be.null;
      expect((dwarf.object.material as any).color.getHex(), 'dwarf is highlighted').to.eq(HIGHLIGHT_COLOR);
      expect(win.__cw.world.selectedEntity).to.eq(dwarf);
      expect((win.__cw.world.runtime.mainHouse.object.material as any).color.getHex(), 'house stays un-highlighted').to.eq(HOUSE_BASE_COLOR);
    });

    // Act: move to empty ground and apply the hover state.
    hoverCell(EMPTY_CELL.x, EMPTY_CELL.y);
    applyHoverTick();

    // Assert: dwarf tint reverts, no entity stays selected.
    cy.window().should((win: any) => {
      const dwarf = getDwarf();
      expect((dwarf.object.material as any).color.getHex()).to.eq(0xffffff);
      expect(win.__cw.world.selectedEntity).to.be.null;
    });
  });
});

// IT-9: Dwarf hitbox tracks the visible dwarf (feedback item 2)
describe('IT-9: the dwarf hitbox follows the dwarf onto fractional positions', () => {
  it('highlights a dwarf whose sprite has crossed into the next cell (round, not floor)', () => {
    cy.visit('/');

    // Arrange: freeze the loop and seed a dwarf on a fractional position whose
    // sprite ([113.6, 114.6]) is mostly on cell 114 — floor-based lookup would
    // only have matched cell (113, 63).
    const getDwarf = seedDwarfAt(113.6, 63.6);
    cy.window().should((win: any) => {
      const dwarf = getDwarf();
      expect(dwarf, 'seeded dwarf present').to.not.be.null;
      expect(dwarf.position.x).to.be.greaterThan(113.5);
      expect(dwarf.position.x).to.be.lessThan(114);
    });

    // Act: hover the cell the sprite's majority is on.
    hoverCell(114, 64);
    applyHoverTick();

    // Assert: the dwarf highlights.
    cy.window().should((win: any) => {
      const dwarf = getDwarf();
      expect((dwarf.object.material as any).color.getHex(), 'dwarf is quarry-blue').to.eq(HIGHLIGHT_COLOR);
      expect(win.__cw.world.selectedEntity).to.eq(dwarf);
    });

    // Act: hover the cell the old floor-based hitbox would have used.
    hoverCell(113, 64);
    applyHoverTick();

    // Assert: that cell is empty — the dwarf is NOT selected from it and its
    // highlight reverted.
    cy.window().should((win: any) => {
      const dwarf = getDwarf();
      expect(win.__cw.services.EntityService.Instance.GetEntityAtPosition({ x: 113, y: 64, z: 0 })).to.be.null;
      expect((dwarf.object.material as any).color.getHex()).to.eq(0xffffff);
      expect(win.__cw.world.selectedEntity).to.be.null;
    });
  });
});
