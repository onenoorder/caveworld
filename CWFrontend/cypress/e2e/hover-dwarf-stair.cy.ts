import { hoverCell, leaveCanvas, expectHighlighted, expectReverted } from '../support/e2e';

// Seeded entities for the dwarf/stair hover specs. These live next to the
// MainHouse at map centre (117, 64), on clear ground away from its footprint
// (3x4 at 117..120 x 64..66).
const HOUSE_X = 117;
const HOUSE_Y = 64;
const DWARF = { x: HOUSE_X + 10, y: HOUSE_Y };
const STAIR = { x: HOUSE_X + 14, y: HOUSE_Y };
const EMPTY_CELL = { x: 5, y: 5 };
const DWARF_BASE_COLOR = 0xffffff;
const STAIR_BASE_COLOR = 0xffffff;

function seedEntity(win: any, kind: 'dwarf' | 'stair') {
  if (kind === 'dwarf') {
    win.__cw.helpers.addDwarf(DWARF.x, DWARF.y);
  } else {
    win.__cw.helpers.addStair(STAIR.x, STAIR.y);
  }
}

// IT-2: Hover over dwarf → blue highlight; move away → revert (P0, AC-2, AC-4)
describe('IT-2: hovering a dwarf highlights it and moving away reverts it', () => {
  it('highlights the dwarf in quarry-blue on hover and reverts on empty-cell move', () => {
    cy.visit('/').then((win: any) => seedEntity(win, 'dwarf'));

    // Act: hover the dwarf cell, then move to empty space.
    hoverCell(DWARF.x, DWARF.y);

    // Assert.
    cy.window().then((win: any) => {
      const dwarf = win.__cw.services.EntityService.Instance.GetEntityAtPosition({ x: DWARF.x, y: DWARF.y, z: 0 });
      expect(dwarf, 'dwarf seeded at cell').to.not.be.null;
      expectHighlighted(dwarf);
    });

    // Act: move away.
    hoverCell(EMPTY_CELL.x, EMPTY_CELL.y);

    // Assert: texture-based dwarf material tint reverted.
    cy.window().then((win: any) => {
      const dwarf = win.__cw.services.EntityService.Instance.GetEntityAtPosition({ x: DWARF.x, y: DWARF.y, z: 0 });
      expectReverted(dwarf, DWARF_BASE_COLOR);
    });
  });
});

// IT-3: Hover over stair → blue highlight; move away → revert (P0, AC-3, AC-4)
describe('IT-3: hovering a stair highlights it and moving away reverts it', () => {
  it('highlights the stair in quarry-blue on hover and reverts on mouse-leave', () => {
    cy.visit('/').then((win: any) => seedEntity(win, 'stair'));

    // Act: hover the stair cell.
    hoverCell(STAIR.x, STAIR.y);

    // Assert.
    cy.window().then((win: any) => {
      const stair = win.__cw.services.EntityService.Instance.GetEntityAtPosition({ x: STAIR.x, y: STAIR.y, z: 0 });
      expect(stair, 'stair seeded at cell').to.not.be.null;
      expectHighlighted(stair);
    });

    // Act: leave the canvas entirely.
    leaveCanvas();

    // Assert: texture-based stair material tint reverted.
    cy.window().then((win: any) => {
      const stair = win.__cw.services.EntityService.Instance.GetEntityAtPosition({ x: STAIR.x, y: STAIR.y, z: 0 });
      expectReverted(stair, STAIR_BASE_COLOR);
    });
  });
});
