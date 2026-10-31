// expectReverted is intentionally NOT used in IT-5: its selectedEntity === null
// assertion is wrong for an entity→entity switch (the correct tracked entity
// after switching to the dwarf IS the dwarf). IT-1/IT-4 keep it.
import { hoverCell, leaveCanvas, expectHighlighted, expectReverted, entityAt } from '../support/e2e';

// MainHouse is placed at map centre by the boot sequence: (240/2 - 3, 135/2 - 3)
// = (117, 64). Its material is a white tint over the building texture — the
// "original color" revert target is MeshBasicMaterial's default white.
const HOUSE_X = 117;
const HOUSE_Y = 64;
const HOUSE_BASE_COLOR = 0xffffff;
// On-screen empty ground clear of the house footprint (117..120 x 64..66).
const EMPTY_CELL = { x: HOUSE_X + 5, y: HOUSE_Y + 5 };

// IT-1: Hover over building → blue highlight; move away → revert (P0, AC-1, AC-4)
describe('IT-1: hovering a building highlights it and moving away reverts it', () => {
  it('highlights the main house in quarry-blue on hover and reverts on leave', () => {
    cy.visit('/');

    // Arrange: verify the boot state before any input.
    entityAt(HOUSE_X, HOUSE_Y).should('not.be.null');

    // Act: hover the house cell, then move to empty space.
    hoverCell(HOUSE_X, HOUSE_Y);

    // Assert: highlighted while hovered (retries until the game frame applies it).
    entityAt(HOUSE_X, HOUSE_Y).then((house) => expectHighlighted(house));

    // Act: move away to an empty cell.
    hoverCell(EMPTY_CELL.x, EMPTY_CELL.y);

    // Assert: reverted to the original building tint.
    entityAt(HOUSE_X, HOUSE_Y).then((house) => expectReverted(house, HOUSE_BASE_COLOR));
  });
});

// IT-4: Mouse off canvas → all highlights cleared (P0, AC-4)
describe('IT-4: moving the mouse off the canvas clears all highlights', () => {
  it('reverts the highlight when the cursor leaves the canvas (mouseleave)', () => {
    cy.visit('/');

    // Arrange: hover the house so a highlight is active.
    hoverCell(HOUSE_X, HOUSE_Y);
    entityAt(HOUSE_X, HOUSE_Y).then((house) => expectHighlighted(house));

    // Act: leave the canvas entirely.
    leaveCanvas();

    // Assert: all highlights cleared.
    entityAt(HOUSE_X, HOUSE_Y).then((house) => expectReverted(house, HOUSE_BASE_COLOR));
  });
});

// IT-5: Hover from building to dwarf → building reverts, dwarf highlights (P1, AC-4, AC-5)
//
// Deterministic rewrite (validate-story 2026-10-31, blocker B1): the previous
// version seeded a LIVE dwarf (world loop unfrozen) while the boot dwarf still
// wandered, then misused expectReverted — whose second assertion demands
// world.selectedEntity === null — for the intermediate building state. Both
// assertions were races on dwarf wander: when the dwarf lingered on its cell
// the null check failed; when it wandered off, entityAt returned null and
// expectHighlighted dereferenced it. Neither outcome reflects a product
// defect: with the dwarf deterministically on its cell, the correct state
// after the switch IS selectedEntity === dwarf.
//
// This rewrite uses the pattern proven in hover-footprint.cy.ts: clear every
// dwarf, park the spawner deep in the past, freeze the world loop while
// seeding, and apply the hover state via one explicit world.tick() per
// cursor move (hover is applied in World.tick()/updateHover()).
describe('IT-5: moving from a building to a dwarf switches the highlight cleanly', () => {
  it('reverts the building and highlights the dwarf without leaving the canvas', () => {
    cy.visit('/');

    // Arrange: a dwarf at a fixed cell next to the house, with every other
    // dwarf removed, the spawner parked, and the simulation loop frozen so
    // nothing can move for the rest of the spec.
    const DWARF = { x: HOUSE_X + 10, y: HOUSE_Y };
    let dwarf: any = null;
    cy.window().then((win: any) => {
      win.__cw.world.stop();
      const service = win.__cw.services.EntityService.Instance;
      service.dwarfs.forEach((d: any) => win.__cw.world.scene.remove(d.object));
      service.dwarfs = [];
      // Tick() spawns when status > 30; park it deep in the past.
      win.__cw.world.spawnService.status = -1000000;
      dwarf = win.__cw.helpers.addDwarf(DWARF.x, DWARF.y);
    });
    // Apply the hover state for the currently selected cell exactly once.
    const tickHover = () => cy.window().then((win: any) => win.__cw.world.tick());

    // Act: hover the house cell and apply exactly one frame.
    hoverCell(HOUSE_X, HOUSE_Y);
    tickHover();

    // Assert: the house is highlighted while hovered.
    cy.window().should((win: any) => {
      expect((win.__cw.world.runtime.mainHouse.object.material as any).color.getHex()).to.eq(0x3a6a8a);
      expect(win.__cw.world.selectedEntity).to.eq(win.__cw.world.runtime.mainHouse);
    });

    // Act: move directly to the dwarf cell (staying on the container — no
    // mouseleave) and apply exactly one frame.
    hoverCell(DWARF.x, DWARF.y);
    tickHover();

    // Assert: the house reverted to its base tint AND the dwarf is
    // highlighted and tracked — the deterministic switch the spec intends.
    cy.window().should((win: any) => {
      expect(dwarf, 'seeded dwarf present').to.not.be.null;
      expect((win.__cw.world.runtime.mainHouse.object.material as any).color.getHex(), 'house reverted').to.eq(HOUSE_BASE_COLOR);
      expect((dwarf.object.material as any).color.getHex(), 'dwarf is quarry-blue').to.eq(0x3a6a8a);
      expect(win.__cw.world.selectedEntity, 'dwarf wins the cell after the switch').to.eq(dwarf);
    });
  });
});

// IT-6: Placement continues to work during hover (P1, AC-5)
describe('IT-6: placement keeps working while hover highlighting is active', () => {
  it('places a building via the toolbar without losing the hover highlight', () => {
    cy.visit('/');

    // Arrange: hover the house so a highlight is active; watch placement calls.
    hoverCell(HOUSE_X, HOUSE_Y);
    entityAt(HOUSE_X, HOUSE_Y).then((house) => expectHighlighted(house));
    cy.window().then((win: any) => {
      const placement = win.__cw.services.PlacementService.Instance;
      cy.spy(placement, 'PlaceBuilding');
    });

    // Act: click a building icon on the toolbar.
    cy.get('img[alt="TinyHouse"]').click();

    // Assert: placement pipeline was invoked; hover state intact.
    cy.window().should((win: any) => {
      expect(win.__cw.services.PlacementService.Instance.PlaceBuilding).to.have.been.called;
      expect(win.__cw.world.selectedEntity).to.eq(win.__cw.services.EntityService.Instance.GetEntityAtPosition({ x: HOUSE_X, y: HOUSE_Y, z: 0 }));
    });
  });
});
