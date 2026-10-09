import { PerspectiveCamera, Vector3 } from 'three';
import { Mouse } from './Mouse';
import { PlacementService } from '_services/index';

// Mouse is pure input logic against a DOM-ish container; a captured-listener
// fake keeps this in jsdom (no real DOM events, no WebGL).
function makeContainer() {
  return {
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    offsetWidth: 800,
    offsetHeight: 600,
  };
}

function makeMouse() {
  const container = makeContainer();
  const camera = new PerspectiveCamera(100, 800 / 600, 1, 10000);
  camera.position.set(0, 0, 10);
  const movement = new Vector3(0, 0, 0);
  const selectedCell = new Vector3(0, 0, 0);
  const mouse = new Mouse(container, camera, movement, selectedCell);

  const listeners: Record<string, (e: any) => void> = {};
  for (const call of container.addEventListener.mock.calls) {
    listeners[call[0] as string] = call[1];
  }

  return { container, camera, movement, selectedCell, mouse, listeners };
}

describe('Mouse hover state (CAV-002)', () => {
  beforeAll(() => {
    jest.useFakeTimers();
    // Click delegates to the placement pipeline; replace the singleton
    // (its real Setup needs a THREE scene).
    (PlacementService as any).Instance = { TryPlace: jest.fn() };
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('registers and unregisters its DOM listeners', () => {
    const { container, mouse, listeners } = makeMouse();

    expect(Object.keys(listeners).sort()).toEqual(['click', 'mouseleave', 'mousemove', 'wheel']);

    mouse.Destroy();

    expect(container.removeEventListener).toHaveBeenCalledTimes(4);
  });

  it('MouseMove marks the mouse as over the canvas and updates the selected cell', () => {
    const { mouse, listeners, selectedCell } = makeMouse();

    listeners['mousemove']({ clientX: 400, clientY: 300 });

    expect(mouse.isMouseOver).toBe(true);
    expect(mouse.clientX).toBe(400);
    expect(mouse.clientY).toBe(300);
    // Center of an 800x600 canvas through the camera at (0,0,10) hits cell (0,0).
    expect(selectedCell.x).toBe(0);
    expect(selectedCell.y).toBe(0);
  });

  it('MouseMove flags border scrolling near the canvas edges', () => {
    const { mouse, listeners } = makeMouse();

    listeners['mousemove']({ clientX: 50, clientY: 550 });

    expect(mouse.moveMovement.x).toBe(-mouse.cameraSpeed);
    expect(mouse.moveMovement.y).toBe(-mouse.cameraSpeed);
    expect(mouse.borderScrollingTimeout).not.toBeNull();

    // After the border-scroll latency the pending movement is applied.
    jest.advanceTimersByTime(750);
    expect(mouse.movement.x).toBe(-mouse.cameraSpeed);
    expect(mouse.movement.y).toBe(-mouse.cameraSpeed);
    expect(mouse.borderScrollingTimeout).toBeNull();
  });

  it('MouseMove scrolls right at the right canvas edge', () => {
    const { mouse, listeners } = makeMouse();

    listeners['mousemove']({ clientX: 750, clientY: 300 });

    expect(mouse.moveMovement.x).toBe(mouse.cameraSpeed);
  });

  it('MouseMove clears camera movement while away from the borders', () => {
    const { mouse, listeners } = makeMouse();

    listeners['mousemove']({ clientX: 400, clientY: 300 });

    expect(mouse.moveMovement.x).toBe(0);
    expect(mouse.moveMovement.y).toBe(0);
  });

  it('MouseLeave clears the hover flag and pending movement', () => {
    const { mouse, listeners, movement } = makeMouse();

    listeners['mousemove']({ clientX: 50, clientY: 50 });
    expect(mouse.isMouseOver).toBe(true);

    listeners['mouseleave']({});

    expect(mouse.isMouseOver).toBe(false);
    expect(movement.x).toBe(0);
    expect(movement.y).toBe(0);
    expect(movement.z).toBe(0);
    expect(mouse.moveMovement.x).toBe(0);
    expect(mouse.moveMovement.y).toBe(0);
    expect(mouse.moveMovement.z).toBe(0);
  });

  it('Scroll zooms in and out, clamping speed at high zoom', () => {
    const { mouse, listeners, camera, movement } = makeMouse();
    camera.position.z = 50; // forces cameraSpeedAtZoomLevel above the max

    listeners['wheel']({ wheelDelta: -120 });

    expect(movement.z).toBe(mouse.cameraZoomSpeed);
    expect(mouse.cameraSpeedAtZoomLevel).toBe(12);

    listeners['wheel']({ wheelDelta: 120 });

    expect(movement.z).toBe(-mouse.cameraZoomSpeed);
  });

  it('Scroll never zooms closer than cameraMinZoom', () => {
    const { mouse, listeners, camera, movement } = makeMouse();
    camera.position.z = 2.9;

    listeners['wheel']({ wheelDelta: -120 });

    expect(movement.z).toBeCloseTo(mouse.cameraMinZoom - 2.9);
  });

  it('Click delegates placement to PlacementService with the selected cell', () => {
    const { mouse, listeners, selectedCell } = makeMouse();
    selectedCell.set(7, 3, 0);

    listeners['click']({});

    expect((PlacementService.Instance as any).TryPlace).toHaveBeenCalledWith(selectedCell);
  });
});
