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
describe('IT-5: moving from a building to a dwarf switches the highlight cleanly', () => {
  it('reverts the building and highlights the dwarf without leaving the canvas', () => {
    cy.visit('/');

    // Arrange: seed a dwarf next to the house via the debug hook.
    const DWARF = { x: HOUSE_X + 10, y: HOUSE_Y };
    cy.window().then((win: any) => {
      win.__cw.helpers.addDwarf(DWARF.x, DWARF.y);
    });

    // Act: hover the house, then move to the dwarf.
    hoverCell(HOUSE_X, HOUSE_Y);
    hoverCell(DWARF.x, DWARF.y);

    // Assert: building reverted, dwarf highlighted.
    entityAt(HOUSE_X, HOUSE_Y).then((house) => expectReverted(house, HOUSE_BASE_COLOR));
    entityAt(DWARF.x, DWARF.y).then((dwarf) => expectHighlighted(dwarf));
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
