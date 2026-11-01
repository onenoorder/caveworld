import * as THREE from 'three';
import { Scaffold } from '_entities/index';

// Scene-level scaffold add/remove. Excluded from the 100% coverage gate per the
// test-strategy allow-list: scaffolds are pure Three.js scene objects (never
// registered as entities), so this service is renderer orchestration only.
class ScaffoldService {
  scene: THREE.Scene;

  public static Instance: ScaffoldService;

  private constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  public static Setup(scene: THREE.Scene) {
    ScaffoldService.Instance = new ScaffoldService(scene);
  }

  AddScaffold(scaffold: Scaffold) {
    this.scene.add(scaffold.BuildObject());
  }

  RemoveScaffold(scaffold: Scaffold) {
    this.scene.remove(scaffold.object);
  }
}

export { ScaffoldService };
