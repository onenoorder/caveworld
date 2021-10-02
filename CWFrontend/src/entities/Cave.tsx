import * as THREE from 'three';
import { TextureService } from '_services/index';
import { ITickableEntity, IWithTextureService } from '_entities/index';

class Cave implements ITickableEntity, IWithTextureService {
  renderer: THREE.WebGLRenderer;
  position: THREE.Vector3;
  object: THREE.Mesh<THREE.BufferGeometry, THREE.Material | THREE.Material[]>;
  height: number;
  width: number;
  count: number = 0;
  texture: THREE.Texture;
  textureHeight: number = 783;
  textureWidth: number = 1126;
  textureUnitSize: number = 48;
  mapTextureId: string = 'Map8k';
  changed: boolean = false;
  cave: number[][];
  caveNeedsUpdate: boolean[][];

  constructor(renderer: THREE.WebGLRenderer, height: number, width: number) {
    this.renderer = renderer;
    this.position = new THREE.Vector3();
    this.height = height;
    this.width = width;
    this.object = new THREE.Mesh();

    this.texture = TextureService.Instance.GetTexture(this.mapTextureId);

    TextureService.Instance.GetExcavationTexture(320);
    TextureService.Instance.GetExcavationTexture(321);
    TextureService.Instance.GetExcavationTexture(322);

    TextureService.Instance.GetExcavationTexture(335);
    TextureService.Instance.GetExcavationTexture(336);
    TextureService.Instance.GetExcavationTexture(337);

    TextureService.Instance.GetExcavationTexture(350);
    TextureService.Instance.GetExcavationTexture(351);
    TextureService.Instance.GetExcavationTexture(352);

    TextureService.Instance.GetExcavationTexture(334);
    TextureService.Instance.GetExcavationTexture(349);
    TextureService.Instance.GetExcavationTexture(364);

    TextureService.Instance.GetExcavationTexture(286);
    TextureService.Instance.GetExcavationTexture(270);

    // dig left
    TextureService.Instance.GetExcavationTexture(160);
    TextureService.Instance.GetExcavationTexture(161);
    TextureService.Instance.GetExcavationTexture(162);
    TextureService.Instance.GetExcavationTexture(163);
    TextureService.Instance.GetExcavationTexture(164);
    TextureService.Instance.GetExcavationTexture(165);
    TextureService.Instance.GetExcavationTexture(166);
    TextureService.Instance.GetExcavationTexture(167);
    TextureService.Instance.GetExcavationTexture(168);
    TextureService.Instance.GetExcavationTexture(169);

    // dig right
    TextureService.Instance.GetExcavationTexture(144);
    TextureService.Instance.GetExcavationTexture(145);
    TextureService.Instance.GetExcavationTexture(146);
    TextureService.Instance.GetExcavationTexture(147);
    TextureService.Instance.GetExcavationTexture(148);
    TextureService.Instance.GetExcavationTexture(149);
    TextureService.Instance.GetExcavationTexture(150);
    TextureService.Instance.GetExcavationTexture(151);
    TextureService.Instance.GetExcavationTexture(152);
    TextureService.Instance.GetExcavationTexture(153);

    this.cave = [];
    this.caveNeedsUpdate = [];
    for(let x: number = 0; x < this.width; x++) {
      this.cave[x] = [];
      this.caveNeedsUpdate[x] = [];
      for(let y: number = 0; y< this.height; y++) {
        this.cave[x][y] = 0;
        this.caveNeedsUpdate[x][y] = false;
      }
    }
  }

  BuildObject() {
    this.object.geometry = new THREE.PlaneGeometry(this.width, this.height, this.width, this.height);
    this.object.material = this.CreateMaterial();

    this.object.position.x += this.position.x + (this.width / 2);
    this.object.position.y += this.position.y + (this.height / 2);

    return this.object;
  }

  Destroy() {
    this.object.clear();
    this.texture.dispose();
  }

  CreateMaterial(): THREE.Material {
    return new THREE.MeshBasicMaterial({ 
      map: this.texture, 
      depthTest: false, 
      transparent: true 
    });
  }

  Rebuild(cave: boolean[][]) {
    for(let x: number = 0; x < this.width; x++)
      for(let y: number = 0; y < this.height; y++)
        if (cave[x][y]) {
          let top = cave[x][y+1];
          let topLeft = cave[x-1][y+1];
          let topRight = cave[x+1][y+1];
          let right = cave[x+1][y];
          let bottom = cave[x][y-1]
          let left = cave[x-1][y];
          let number = 0;

          if (!top && right && bottom && !left) {
            number = 320;
          } else if (top && right && bottom && !left) {
            number = 321;
          } else if (top && right && !bottom && !left) {
            number = 322;
          } else if (top && right && bottom && left) {
            number = 336;
          } else if (top && right && !bottom && left) {
            if (topLeft && topRight) {
              number = 337;
            } else if (!topLeft) {
              number = 286;
            } else {
              number = 270;
            }
          } else if (!top && right && bottom && left) {
            number = 335;
          } else if (!top && !right && bottom && left) {
            number = 350;
          } else if (top && !right && bottom && left) {
            number = 351;
          } else if (top && !right && !bottom && left) {
            number = 352;
          } else if (!top && right && !bottom && !left) {
            number = 334;
          } else if (!top && right && !bottom && left) {
            number = 349;
          } else if (!top && !right && !bottom && left) {
            number = 364;
          }

          if (number !== this.cave[x][y]) {
            this.cave[x][y] = number;
            this.caveNeedsUpdate[x][y] = true;
          }
        }
    this.changed = true;
  }

  UpdateTextureOnPosition(x: number, y: number, textureId: number) {
    this.cave[x][y] = textureId;
    this.caveNeedsUpdate[x][y] = true;
    this.changed = true;
  }

  Tick(delta: number) {
    if (this.changed) {
      this.count++;
      if (this.count > 10) {
        this.count = 0;
        if (TextureService.Instance.IsLoaded(this.mapTextureId)) {
          this.changed = false;
          for(let x: number = 0; x < this.width; x++)
            for(let y: number = 0; y < this.height; y++)
              if (this.caveNeedsUpdate[x][y] && this.cave[x][y] !== 0) {
                if (TextureService.Instance.IsExcavationLoaded(this.cave[x][y])) {
                  this.renderer.copyTextureToTexture(new THREE.Vector2(x * this.textureUnitSize, y * this.textureUnitSize), TextureService.Instance.GetExcavationTexture(this.cave[x][y]), this.texture);
                  this.caveNeedsUpdate[x][y] = false;
                } else {
                  this.changed = true;
                }
              }
        }
      }
    }
  }
}

export { Cave };