import * as THREE from 'three';
import { TextureService } from '_services/index';
import { IEntity, IWithTextureService } from '_entities/index';
import { BuildingIds } from '_utilities/Enums/BuildingIds';

class Placement implements IEntity, IWithTextureService {
  position: THREE.Vector3;
  object: THREE.Mesh<THREE.BufferGeometry, THREE.Material | THREE.Material[]>;
  texture: THREE.Texture;
  height: number;
  width: number;
  buildingId: BuildingIds;
  jobId: number;
  textureHeight: number = 1449;
  textureWidth: number = 1163;
  textureUnitSize: number = 48;
  canPlace: boolean;

  constructor() {
    this.texture = TextureService.Instance.GetTexture('PlacementCursors');
    this.position = new THREE.Vector3();
    this.object = new THREE.Mesh();
    this.height = 0;
    this.width = 0;
    this.buildingId = 0;
    this.jobId = 0;
    this.canPlace = false;
  }

  SetPosition(position: THREE.Vector3) {
    this.position.copy(position);
    this.position.x += this.width / 2;
    this.position.y += this.height / 2;
    this.object.position.copy(this.position);
    this.object.position.z = 0.00002;
  }

  SetCanPlace(canPlace: boolean) {
    if (this.canPlace !== canPlace) {
      this.canPlace = canPlace;

      if (this.jobId > 0)
        this.SetJob(this.jobId);
      else if (this.buildingId > 0)
        this.SetBuilding(this.buildingId);
    }
  }

  SetBuilding(buildingId: BuildingIds) {
    this.buildingId = buildingId;
    
    switch(this.buildingId) {
      case BuildingIds.TinyHouse:
        this.height = 2;
        this.width = 2;
        if (this.canPlace) {
          this.texture.offset.x = 1 / this.textureWidth * ((this.textureUnitSize * 10) + 3);
          this.texture.offset.y = 1 / this.textureHeight * ((this.textureUnitSize * 26) + 8);
        } else {
          this.texture.offset.x = 1 / this.textureWidth * ((this.textureUnitSize * 8) + 2);
          this.texture.offset.y = 1 / this.textureHeight * ((this.textureUnitSize * 26) + 8);
        }
      break;
      case BuildingIds.SmallHouse:
        this.height = 3;
        this.width = 3;
        if (this.canPlace) {
          this.texture.offset.x = 1 / this.textureWidth * ((this.textureUnitSize * 21) + 5);
          this.texture.offset.y = 1 / this.textureHeight * ((this.textureUnitSize * 13) + 4);
        } else {
          this.texture.offset.x = 1 / this.textureWidth * ((this.textureUnitSize * 18) + 4);
          this.texture.offset.y = 1 / this.textureHeight * ((this.textureUnitSize * 13) + 4);
        }
      break;
      case BuildingIds.MediumHouse:
        this.height = 3;
        this.width = 2;
        if (this.canPlace) {
          this.texture.offset.x = 1 / this.textureWidth * ((this.textureUnitSize * 18) + 7);
          this.texture.offset.y = 1 / this.textureHeight * ((this.textureUnitSize * 27) + 9);
        } else {
          this.texture.offset.x = 1 / this.textureWidth * ((this.textureUnitSize * 16) + 6);
          this.texture.offset.y = 1 / this.textureHeight * ((this.textureUnitSize * 27) + 9);
        }
      break;
      case BuildingIds.BigHouse:
        this.height = 3;
        this.width = 4;
        if (this.canPlace) {
          this.texture.offset.x = 1 / this.textureWidth * ((this.textureUnitSize * 4) + 1);
          this.texture.offset.y = 1 / this.textureHeight * ((this.textureUnitSize * 4) + 1);
        } else {
          this.texture.offset.x = 0;
          this.texture.offset.y = 1 / this.textureHeight * ((this.textureUnitSize * 4) + 1);
        }
      break;
      case BuildingIds.HugeHouse:
        this.height = 4;
        this.width = 5;
        if (this.canPlace) {
          this.texture.offset.x = 1 / this.textureWidth * ((this.textureUnitSize * 19) + 3);
          this.texture.offset.y = 0;
        } else {
          this.texture.offset.x = 1 / this.textureWidth * ((this.textureUnitSize * 14) + 2);
          this.texture.offset.y = 0;
        }
      break;
      case BuildingIds.SmallStorageHouse:
        this.height = 2;
        this.width = 2;
        if (this.canPlace) {
          this.texture.offset.x = 1 / this.textureWidth * ((this.textureUnitSize * 10) + 3);
          this.texture.offset.y = 1 / this.textureHeight * ((this.textureUnitSize * 28) + 9);
        } else {
          this.texture.offset.x = 1 / this.textureWidth * ((this.textureUnitSize * 8) + 2);
          this.texture.offset.y = 1 / this.textureHeight * ((this.textureUnitSize * 28) + 9);
        }
      break;
      case BuildingIds.MediumStorageHouse:
        this.height = 2;
        this.width = 4;
        if (this.canPlace) {
          this.texture.offset.x = 1 / this.textureWidth * ((this.textureUnitSize * 4) + 1);
          this.texture.offset.y = 1 / this.textureHeight * ((this.textureUnitSize * 28) + 9);
        } else {
          this.texture.offset.x = 1 / this.textureWidth * (this.textureUnitSize * 0);
          this.texture.offset.y = 1 / this.textureHeight * ((this.textureUnitSize * 28) + 9);
        }
      break;
      case BuildingIds.BigStorageHouse:
        this.height = 3;
        this.width = 4;
        if (this.canPlace) {
          this.texture.offset.x = 1 / this.textureWidth * ((this.textureUnitSize * 4) + 1);
          this.texture.offset.y = 1 / this.textureHeight * ((this.textureUnitSize * 7) + 2);
        } else {
          this.texture.offset.x = 0;
          this.texture.offset.y = 1 / this.textureHeight * ((this.textureUnitSize * 7) + 2);
        }
      break;
    }

    this.texture.repeat.x = 1 / this.textureWidth * (this.textureUnitSize * this.width);
    this.texture.repeat.y = 1 / this.textureHeight * (this.textureUnitSize * this.height);

    this.object.geometry.dispose();
    this.object.geometry = new THREE.PlaneGeometry(this.width, this.height);
  }

  SetJob(jobId: number) {
    this.jobId = jobId;
    
    this.height = 1;
    this.width = 1;

    switch(this.jobId) {
      case 1:
        if (this.canPlace) {
          this.texture.offset.x = 1 / this.textureWidth * ((this.textureUnitSize * 21) + 9);
          this.texture.offset.y = 1 / this.textureHeight * ((this.textureUnitSize * 28) + 8);
        } else {
          this.texture.offset.x = 1 / this.textureWidth * ((this.textureUnitSize * 20) + 8);
          this.texture.offset.y = 1 / this.textureHeight * ((this.textureUnitSize * 28) + 8);
        }
      break;
      case 2:
        if (this.canPlace) {
          this.texture.offset.x = 1 / this.textureWidth * ((this.textureUnitSize * 23) + 12);
          this.texture.offset.y = 1 / this.textureHeight * ((this.textureUnitSize * 28) + 8);
        } else {
          this.texture.offset.x = 1 / this.textureWidth * ((this.textureUnitSize * 22) + 10);
          this.texture.offset.y = 1 / this.textureHeight * ((this.textureUnitSize * 28) + 8);
        }
      break;
    }

    this.texture.repeat.x = 1 / this.textureWidth * (this.textureUnitSize * this.width);
    this.texture.repeat.y = 1 / this.textureHeight * (this.textureUnitSize * this.height);

    this.object.geometry.dispose();
    this.object.geometry = new THREE.PlaneGeometry(this.width, this.height);
  }

  BuildObject() {
    this.object.geometry.dispose();
    this.object.geometry = new THREE.PlaneGeometry(this.width, this.height);
    this.object.material = this.CreateMaterial();
    this.object.position.z = 0.2;

    return this.object;
  }

  CreateMaterial(): THREE.Material {
    return new THREE.MeshBasicMaterial({ 
      map: this.texture, 
      depthTest: false, 
      transparent: true 
    });
  }

  Destroy() {
    this.texture.dispose();
    this.object.remove();
  }
}

export { Placement };