import { Vector3 } from 'three';
import { PlantingTask } from '_tasks/index';
import { PlantingGoal } from '_goals/index';
import { Bamboo } from '_buildings/index';
import { EntityService, TextureService } from '_services/index';

// CAV-004 (test design 0f67245b): the single task of a PlantingJob hands a
// PlantingGoal to the dwarf — walking to the spot is the whole job (D3).

function setupDoubles() {
  const fakeTexture = { dispose: jest.fn() } as any;
  (TextureService as any).Instance = {
    Destroy: jest.fn(),
    GetTexture: jest.fn(() => fakeTexture),
    GetBuildingTexture: jest.fn(() => fakeTexture),
    GetBuildingTextureWithState: jest.fn(() => fakeTexture),
  };
  (EntityService as any).Instance = {
    GetSeedCells: jest.fn(() => []),
    EnqueueSeed: jest.fn(),
  } as any;
}

describe('PlantingTask (CAV-004)', () => {
  beforeEach(() => setupDoubles());

  it('creates a PlantingGoal for the dwarf bound to the plant', () => {
    // Arrange
    const plant = new Bamboo(new Vector3(4, 2, 0));
    const task = new PlantingTask(plant);
    const dwarf = { position: new Vector3(0, 2, 0) } as any;

    // Act
    const goal = task.CreateGoal(dwarf);

    // Assert
    expect(goal).toBeInstanceOf(PlantingGoal);
    expect((goal as PlantingGoal).plant).toBe(plant);
  });

  it('stores the plant it was created for', () => {
    // Arrange + Act
    const plant = new Bamboo(new Vector3(1, 1, 0));
    const task = new PlantingTask(plant);

    // Assert
    expect(task.plant).toBe(plant);
  });
});
