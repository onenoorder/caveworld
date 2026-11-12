import * as THREE from 'three';
import { MeshBasicMaterial, Material, PlaneGeometry, Mesh } from 'three';
import { Building } from '_buildings/index';
import { IPlant } from '_buildings/index';
import { TextureService, EntityService, MapService } from '_services/index';

// CAV-004: growth and seeding timing constants (architecture D4/D6).
// One nursery frame advances every GROWTH_FRAME_SECONDS; total growing time
// is (frameCount - 1) * GROWTH_FRAME_SECONDS; seeding opens at 50% of it and
// rolls at most once per SEED_ROLL_SECONDS, continuing through maturity.
const GROWTH_FRAME_SECONDS = 60;
const SEED_ROLL_SECONDS = 60;

// Seed-cell sampling: the candidate cell next to the plant's footprint that
// a seeding roll considers. Injectable at this boundary so unit tests are
// deterministic (test design S6); production picks one random candidate.
export type SeedCellSource = () => THREE.Vector3 | null;

function defaultSeedCellSource(plant: IPlant): SeedCellSource {
  return () => {
    const candidates: THREE.Vector3[] = EntityService.Instance.GetSeedCells(
      plant.position, plant.height, plant.width);
    if (candidates.length === 0)
      return null;
    return candidates[Math.floor(Math.random() * candidates.length)];
  };
}

abstract class Plant extends Building implements IPlant {
  planted: boolean = false;
  frame: number = 0;
  frameCount: number;
  elapsedSincePlanted: number = 0;
  nextSeedAt: number;
  seedCellSource: SeedCellSource;

  constructor(
    name: string,
    position: THREE.Vector3,
    height: number,
    width: number,
    frameCount: number,
    seedCellSource?: SeedCellSource
  ) {
    super(name, position, height, width, 0);
    this.frameCount = frameCount;
    this.nextSeedAt = this.seedWindow();
    this.seedCellSource = seedCellSource || defaultSeedCellSource(this);
  }

  // 50 % of the plant's total growing time (architecture D6).
  private seedWindow(): number {
    return ((this.frameCount - 1) * GROWTH_FRAME_SECONDS) / 2;
  }

  // Transition PENDING -> GROWING (architecture D8): mesh becomes visible at
  // frame 0 and the growth clock starts. Idempotent: a second call neither
  // re-hides the mesh nor resets the clock (test G5).
  Plant(): void {
    if (this.planted)
      return;

    this.planted = true;
    this.elapsedSincePlanted = 0;
    this.nextSeedAt = this.seedWindow();
    this.object.visible = true;
  }

  IsBuild(): boolean {
    return this.planted;
  }

  // Creates a seeded offspring of the same type at a cell — planted by
  // definition (frame 0, mesh visible, growth + seeding running). Called by
  // EntityService.RegisterSeed after CanPlace re-validation (D6).
  abstract Seed(cell: THREE.Vector3): IPlant;

  Tick(delta: number): void {
    if (!this.planted)
      return;

    this.elapsedSincePlanted += delta;

    // Growth: one nursery frame per GROWTH_FRAME_SECONDS, capped at the
    // mature frame (frameCount - 1); texture swaps only on frame change.
    const frame = Math.min(
      this.frameCount - 1,
      Math.floor(this.elapsedSincePlanted / GROWTH_FRAME_SECONDS));
    if (frame !== this.frame) {
      this.frame = frame;
      (this.object.material as MeshBasicMaterial).map =
        TextureService.Instance.GetBuildingTextureWithState(
          this.name, this.frame, this.frameCount - 1);
    }

    this.TrySeed();
  }

  private TrySeed(): void {
    // Catch-up loop: exactly one roll per elapsed 60 s cadence slot, so a
    // single large delta (e.g. a throttled/backgrounded frame loop) neither
    // starves seeding nor bursts beyond the cadence (test S5).
    while (this.elapsedSincePlanted >= this.nextSeedAt) {
      this.nextSeedAt += SEED_ROLL_SECONDS;

      const cell = this.seedCellSource();
      if (cell === null)
        continue;

      if (!MapService.Instance.CanPlace(cell, this.height, this.width))
        continue;

      EntityService.Instance.EnqueueSeed(this, cell);
    }
  }

  // Builds the plant's mesh hidden until a dwarf plants it (D8). Seeded
  // plants show frame 0 immediately (planted by definition).
  BuildObject() {
    const geometry = new PlaneGeometry(this.width, this.height);
    this.object = new Mesh(geometry, this.CreateMaterial());
    this.object.position.x += this.position.x + (this.width / 2);
    this.object.position.y += this.position.y + (this.height / 2);
    this.object.visible = this.planted;
    return this.object;
  }

  CreateMaterial(): Material {
    return new MeshBasicMaterial({
      map: TextureService.Instance.GetBuildingTextureWithState(
        this.name, 0, this.frameCount - 1),
      depthTest: false,
      transparent: true
    });
  }
}

export { Plant, GROWTH_FRAME_SECONDS, SEED_ROLL_SECONDS };