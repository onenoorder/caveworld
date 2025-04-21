import { Vector3 } from 'three';
import { BuildingFactory, ConstructionFactory, JobFactory } from '_factories/index';
import { Placement, TempJobPlacement } from '_entities/index';
import { EntityService, MapService } from '_services/index';
import { BuildingIds, JobIds } from '_utilities/Enums';

class PlacementService {
  scene: THREE.Scene;
  placementPreview: Placement;
  tempJobPlacements: TempJobPlacement[];
  jobStartPosition: Vector3 | null;

  public static Instance: PlacementService;

  private constructor(scene: THREE.Scene) {
    this.scene = scene;

    this.placementPreview = new Placement();
    this.tempJobPlacements = [];
    this.jobStartPosition = null;
  }

  public static Setup(scene: THREE.Scene) {
    if (PlacementService.Instance)
      PlacementService.Instance.Destroy();

    PlacementService.Instance = new PlacementService(scene);
  }

  Destroy() {
    this.placementPreview.Destroy();
    this.DestroyTempJobPlacements();
  }

  DestroyTempJobPlacements() {
    this.tempJobPlacements.forEach(tempJobPlacement => {
      this.scene.remove(tempJobPlacement.object);
      tempJobPlacement.Destroy();
    });
  }

  BuildOneTempJobPath(tempJobPlacementPosition: Vector3) {
    let tempJobPlacement = new TempJobPlacement(tempJobPlacementPosition, this.placementPreview.canPlace);
    this.tempJobPlacements.push(tempJobPlacement);
    this.scene.add(tempJobPlacement.BuildObject());
  }

  BuildTempJobPath(position: Vector3, jobId: number) {
    this.DestroyTempJobPlacements();

    if (jobId === 1) {
      if (this.jobStartPosition && position.x > this.jobStartPosition.x) {
        for (let x = this.jobStartPosition.x; x <= position.x; x++) {
          let tempJobPlacementPosition = this.jobStartPosition.clone();
          tempJobPlacementPosition.x = x;
          this.BuildOneTempJobPath(tempJobPlacementPosition);
        }
      } else if (this.jobStartPosition && position.x < this.jobStartPosition.x) {
        for (let x = position.x; x <= this.jobStartPosition.x; x++) {
          let tempJobPlacementPosition = this.jobStartPosition.clone();
          tempJobPlacementPosition.x = x;
          this.BuildOneTempJobPath(tempJobPlacementPosition);
        }
      }
    } else {
      if (this.jobStartPosition && position.y > this.jobStartPosition.y) {
        for (let y = this.jobStartPosition.y; y <= position.y; y++) {
          let tempJobPlacementPosition = this.jobStartPosition.clone();
          tempJobPlacementPosition.y = y;
          this.BuildOneTempJobPath(tempJobPlacementPosition);
        }
      } else if (this.jobStartPosition && position.y < this.jobStartPosition.y) {
        for (let y = position.y; y <= this.jobStartPosition.y; y++) {
          let tempJobPlacementPosition = this.jobStartPosition.clone();
          tempJobPlacementPosition.y = y;
          this.BuildOneTempJobPath(tempJobPlacementPosition);
        }
      }
    }
  }

  PlaceBuilding(buildingId: BuildingIds) {
    if (this.placementPreview.jobId > 0) {
      this.placementPreview.jobId = 0;
      this.jobStartPosition = null;
      this.DestroyTempJobPlacements();
    }

    if (buildingId === this.placementPreview.buildingId) {
      this.scene.remove(this.placementPreview.object);
      this.placementPreview.SetBuilding(0);
    } else if (this.placementPreview.buildingId === BuildingIds.MainHouse) {
      this.placementPreview.SetBuilding(buildingId);
      this.scene.add(this.placementPreview.BuildObject());
    } else {
      this.placementPreview.SetBuilding(buildingId);
    }
  }

  PlaceJob(jobId: number) {
    if (this.placementPreview.buildingId > 0)
      this.placementPreview.buildingId = 0;

    let noJobActive = this.placementPreview.jobId === 0;

    if (jobId === this.placementPreview.jobId || (!noJobActive && jobId !== this.placementPreview.jobId)) {
      this.scene.remove(this.placementPreview.object);
      this.placementPreview.SetJob(0);
      this.jobStartPosition = null;
      this.DestroyTempJobPlacements();
    } else if (noJobActive) {
      this.placementPreview.SetJob(jobId);
      this.scene.add(this.placementPreview.BuildObject());
    } else {
      this.placementPreview.SetJob(jobId);
    }
  }

  SetPosition(position: Vector3) {
    if ((this.placementPreview.buildingId !== 0 || this.placementPreview.jobId !== 0) &&
      this.placementPreview.position !== position) {
      this.placementPreview.SetPosition(position);

      let jobId = this.placementPreview.jobId;
      if (jobId > 0) {
        if (this.jobStartPosition) {
          let digPosition = position.clone();
          if (jobId === JobIds.Dig) {
            digPosition.y = this.jobStartPosition.y;
            this.placementPreview.SetCanPlace(MapService.Instance.CanPlaceDig(digPosition));
          } else {
            digPosition.x = this.jobStartPosition.x;
            this.placementPreview.SetCanPlace(MapService.Instance.CanPlaceStair(digPosition));
          }
          this.BuildTempJobPath(digPosition, jobId);
        } else {
          let canPlace = jobId === JobIds.Dig ? MapService.Instance.CanPlaceDigStart(position) : MapService.Instance.CanPlaceStairStart(position);
          this.placementPreview.SetCanPlace(canPlace);
        }
      }
      else if (this.placementPreview.buildingId > 0)
        this.placementPreview.SetCanPlace(MapService.Instance.CanPlace(position, this.placementPreview.height, this.placementPreview.width));
    }
  }

  TryPlace(position: Vector3) {
    if (this.placementPreview.jobId > 0) {
      this.TryPlaceJob(position);
    } else if (this.placementPreview.buildingId > 0) {
      this.TryBuild(position);
    }
  }

  TryBuild(position: Vector3) {
    if (this.placementPreview.buildingId > 0) {
      let building = BuildingFactory.Build(this.placementPreview.buildingId, position.clone());
      
      if (!EntityService.Instance.TryAddBuilding(building)) {
        building.Destroy();
        this.PlaceBuilding(this.placementPreview.buildingId);
      }
    }
  }

  TryPlaceJob(position: Vector3) {
    let jobId = this.placementPreview.jobId;
    if (jobId > 0 && this.placementPreview.canPlace) {
      if (!this.jobStartPosition) {
        this.jobStartPosition = position.clone();
        this.BuildTempJobPath(position, jobId);
      } else if (this.placementPreview.canPlace) {
        let job = JobFactory.Build(jobId, this.jobStartPosition.clone(), position.clone());
        EntityService.Instance.AddJob(job);
        EntityService.Instance.AddConstruction(ConstructionFactory.BuildFromJob(job));
        this.PlaceJob(jobId);
      } else {
        this.PlaceJob(jobId);
      }
    }
  }
}

export { PlacementService };