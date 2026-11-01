// CAV-002 hover-highlight spec support.
//
// The game renders into an opaque WebGL canvas — mesh/material state is not in
// the DOM. All assertions go through the app-bundle debug hook (`window.__cw`)
// exposed by World's constructor; a spec-side import of game modules would
// create a second module graph with its own (unset) service singletons.

// Resolve the projected screen position of a grid cell centre through the live
// camera (the world itself is never mutated by the specs).
export function cellScreenPosition(x: number, y: number): Cypress.Chainable<{ x: number; y: number }> {
  return cy
    .window()
    .then((win: any) => {
      const pos = win.__cw.helpers.worldToScreen(x, y);
      return { x: pos.x, y: pos.y };
    });
}

// Hover a grid cell by firing mousemove with document coordinates. The mouse
// listeners live on the game container (which wraps the canvas), and the
// absolutely positioned toolbar sits above the world, so the event is fired on
// the container element directly.
export function hoverCell(x: number, y: number): void {
  cy.document().then((doc: any) => {
    const container = doc.querySelector('div[style*="width: 80%"]') as HTMLElement | null;
    expect(container, 'game container present').to.not.be.null;
  });
  cellScreenPosition(x, y).then(({ x: px, y: py }) => {
    cy.get('div[style*="width: 80%"]').trigger('mousemove', px, py, { eventConstructor: 'MouseEvent' });
  });
}

// Move the mouse off the canvas entirely (mouseleave on the game container).
export function leaveCanvas(): void {
  cy.get('div[style*="width: 80%"]').trigger('mouseleave', { eventConstructor: 'MouseEvent' });
}

// The game applies hover state on its next animation frame (updateHover runs in
// tick), so these assertions retry until the frame has processed the input —
// `.should` with a callback re-runs it on Cypress' default command timeout.
export function expectHighlighted(entity: unknown): void {
  cy.window().should((win: any) => {
    const color = (entity as any).object.material.color;
    expect(color.getHex(), 'entity is quarry-blue highlighted').to.eq(0x3a6a8a);
    expect(win.__cw.world.selectedEntity, 'world tracks the hovered entity').to.eq(entity);
  });
}

export function expectReverted(entity: unknown, originalColor: number): void {
  cy.window().should((win: any) => {
    const color = (entity as any).object.material.color;
    expect(color.getHex(), 'entity reverted to its original color').to.eq(originalColor);
    expect(win.__cw.world.selectedEntity, 'world no longer tracks an entity').to.be.null;
  });
}

// Fetch an entity straight from the app-bundle EntityService. The lookup only
// reads position.x/y, so a plain object stands in for a THREE.Vector3.
export function entityAt(x: number, y: number): Cypress.Chainable<unknown> {
  return cy.window().then((win: any) => {
    const service = win.__cw.services.EntityService.Instance;
    return service.GetEntityAtPosition({ x, y, z: 0 });
  });
}
