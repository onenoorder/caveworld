import { Vector3 } from 'three';
import { BuildingFactory, ConstructionFactory, JobFactory } from '_factories/index';
import { Placement, TempJobPlacement } from '_entities/index';
import { EntityService, MapService } from '_services/index';
import { BuildingIds, JobIds } from '_utilities/Enums';

class InteractiontService {
  scene: THREE.Scene;
  run: Boolean;

  public static Instance: InteractiontService;

  private constructor(scene: THREE.Scene) {
    this.scene = scene;

    this.run = true;
  }

  public static Setup(scene: THREE.Scene) {
  }

  Destroy() {
  }

  public Start() {

  }

  public Stop() {

  }

  TryInteract(position: Vector3) {
    
  }
}

export { InteractiontService };