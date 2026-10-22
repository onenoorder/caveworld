import { hoverCell, leaveCanvas, expectHighlighted, expectReverted, entityAt } from '../support/e2e';

// Seeded entities for the dwarf/stair hover specs. These live next to the
// MainHouse at map centre (117, 64), on clear ground away from its footprint
// (3x4 at 117..120 x 64..66). All materials are white tints over textures —
// the revert target is MeshBasicMaterial's default white.
const HOUSE_X = 117;
const HOUSE_Y = 64;
const DWARF = { x: HOUSE_X + 10, y: HOUSE_Y };
const STAIR = { x: HOUSE_X + 14, y: HOUSE_Y };
const EMPTY_CELL = { x: HOUSE_X + 5, y: HOUSE_Y + 5 };
const DWARF_BASE_COLOR = 0xffffff;
const STAIR_BASE_COLOR = 0xffffff;

// IT-2: Hover over dwarf → blue highlight; move away → revert (P0, AC-2, AC-4)
describe('IT-2: hovering a dwarf highlights it and moving away reverts it', () => {
  it('highlights the dwarf in quarry-blue on hover and reverts on empty-cell move', () => {
    cy.visit('/');
    cy.window().then((win: any) => win.__cw.helpers.addDwarf(DWARF.x, DWARF.y));

    // Act: hover the dwarf cell, then move to empty space.
    hoverCell(DWARF.x, DWARF.y);

    // Assert (retries until the game frame applies the highlight).
    entityAt(DWARF.x, DWARF.y).then((dwarf) => expectHighlighted(dwarf));

    // Act: move away.
    hoverCell(EMPTY_CELL.x, EMPTY_CELL.y);

    // Assert: texture-based dwarf material tint reverted.
    entityAt(DWARF.x, DWARF.y).then((dwarf) => expectReverted(dwarf, DWARF_BASE_COLOR));
  });
});

// IT-3: Hover over stair → blue highlight; move away → revert (P0, AC-3, AC-4)
describe('IT-3: hovering a stair highlights it and moving away reverts it', () => {
  it('highlights the stair in quarry-blue on hover and reverts on mouse-leave', () => {
    cy.visit('/');
    cy.window().then((win: any) => win.__cw.helpers.addStair(STAIR.x, STAIR.y));

    // Act: hover the stair cell.
    hoverCell(STAIR.x, STAIR.y);

    // Assert.
    entityAt(STAIR.x, STAIR.y).then((stair) => expectHighlighted(stair));

    // Act: leave the canvas entirely.
    leaveCanvas();

    // Assert: texture-based stair material tint reverted.
    entityAt(STAIR.x, STAIR.y).then((stair) => expectReverted(stair, STAIR_BASE_COLOR));
  });
});
