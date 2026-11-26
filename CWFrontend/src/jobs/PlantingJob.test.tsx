import { Vector3 } from 'three';
import { PlantingJob } from '_jobs/index';
import { PlantingTask } from '_tasks/index';
import { Bamboo } from '_buildings/index';
import { EntityService, TextureService } from '_services/index';

// CAV-004 J1 (test design 0f67245b): PlantingJob is a one-task job with
// dwarfsLimit 1 — the walk is the whole job (architecture D3).

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

describe('PlantingJob (CAV-004 J1)', () => {
  beforeEach(() => setupDoubles());

  it('contains exactly one PlantingTask for the plant', () => {
    // Arrange
    const plant = new Bamboo(new Vector3(4, 2, 0));

    // Act
    const job = new PlantingJob(plant);

    // Assert
    expect(job.tasks.Size()).toBe(1);
    expect(job.tasks.Pop()).toBeInstanceOf(PlantingTask);
  });

  it('stays active after its task is handed out and completes when planting finishes', () => {
    // Arrange
    const plant = new Bamboo(new Vector3(4, 2, 0));
    const job = new PlantingJob(plant);

    // Act + Assert — task handoff does not mean planting is complete.
    expect(job.IsCompleted()).toBe(false);
    const goal = job.Work({ position: new Vector3(0, 0, 0) } as any)!;
    expect(job.IsCompleted()).toBe(false);

    goal.completed = true;
    expect(job.IsCompleted()).toBe(true);
  });

  it('accepts exactly one dwarf (dwarfsLimit = 1)', () => {
    // Arrange
    const plant = new Bamboo(new Vector3(4, 2, 0));
    const job = new PlantingJob(plant);
    const dwarf = { position: new Vector3(0, 0, 0) } as any;

    // Act
    job.AddDwarf(dwarf);

    // Assert
    expect(job.IsFull()).toBe(true);
    expect(job.dwarfsLimit).toBe(1);
  });

  it('carries the plant footprint in its position data (nearest-job selection)', () => {
    // Arrange
    const plant = new Bamboo(new Vector3(4, 2, 0));

    // Act
    const job = new PlantingJob(plant);

    // Assert
    expect(job.position).toEqual(plant.position);
    expect(job.height).toBe(2);
    expect(job.width).toBe(1);
    expect(job.name).toBe('Bamboo');
  });
});
