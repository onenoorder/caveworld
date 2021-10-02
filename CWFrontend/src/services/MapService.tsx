import { Vector3 } from 'three';
import { Graph, IGraph } from '_utilities/index';
import { Cave, Map } from '_entities/index';

class MapService {
  scene: THREE.Scene;
  renderer: THREE.WebGLRenderer;
  height: number;
  width: number;
  map: Map;
  cave: Cave;
  buildable: boolean[][];
  workable: boolean[][];
  walkLevel: number = 0.01;
  paths: IGraph;

  public static Instance: MapService;

  private constructor(scene: THREE.Scene, renderer: THREE.WebGLRenderer, height: number, width: number) {
    this.scene = scene;
    this.renderer = renderer;
    this.height = height;
    this.width = width;
    this.paths = new Graph();

    this.map = new Map(this.height, this.width);
    this.scene.add(this.map.BuildObject());

    this.cave = new Cave(renderer, this.height, this.width);
    this.scene.add(this.cave.BuildObject());

    this.buildable = [];
    this.workable = [];

    for(let x: number = 0; x < this.width; x++) {
      this.buildable[x] = [];
      this.workable[x] = [];
      for(let y: number = 0; y< this.height; y++) {
        this.buildable[x][y] = false;
        this.workable[x][y] = false;
      }
    }
  }

  public static Setup(scene: THREE.Scene, renderer: THREE.WebGLRenderer, height: number, width: number) {
    if (MapService.Instance)
      MapService.Instance.Destroy();

    MapService.Instance = new MapService(scene, renderer, height, width);
  }

  Destroy() {
    this.map.Destroy();
    this.cave.Destroy();
  }

  CanPlace(position: Vector3, height: number, width: number): boolean {
    if (position.x + width > this.width ||
        position.y + height > this.height ||
        position.x < 0 || position.y < 0)
      return false;

    for(let x: number = position.x; x < position.x + width; x++)
      for(let y: number = position.y; y < position.y + height; y++)
          if (!this.buildable[x][y])
            return false;

    for(let x: number = position.x; x < position.x + width; x++)
      if (this.workable[x][position.y - 1])
        return false;

    return true;
  }

  CanPlaceDigStart(position: Vector3): boolean {
    if (position.x > this.width - 1 ||
      position.y > this.height - 1 ||
      position.x < 0 || position.y < 0)
      return false;

    if (!this.workable[position.x][position.y] || this.workable[position.x][position.y - 1])
      return false;
    
    return !this.workable[position.x + 1][position.y] || !this.workable[position.x - 1][position.y];
  }

  CanPlaceDig(position: Vector3): boolean {
    if (position.x > this.width - 1 ||
      position.y > this.height - 1 ||
      position.x < 0 || position.y < 0)
      return false;
    
    return !this.workable[position.x][position.y];
  }

  CanPlaceStair(position: Vector3): boolean {
    if (position.x > this.width - 1 ||
      position.y > this.height - 1 ||
      position.x < 0 || position.y < 0)
      return false;
    
    return !this.workable[position.x][position.y];
  }

  CanPlaceStairStart(position: Vector3): boolean {
    if (position.x > this.width - 1 ||
      position.y > this.height - 1 ||
      position.x < 0 || position.y < 0)
      return false;

      if (!this.workable[position.x][position.y] || this.workable[position.x][position.y - 1])
      return false;
    
    return !this.workable[position.x][position.y + 1] || !this.workable[position.x][position.y - 1];
  }

  CanBeReached(position: Vector3): boolean {
    if (position.x > this.width - 1 ||
      position.y > this.height - 1 ||
      position.x < 0 || position.y < 0)
      return false;
    
    return this.workable[position.x][position.y];
  }

  Build(position: Vector3, height: number, width: number) {
    for(let x: number = position.x; x < position.x + width; x++)
      for(let y: number = position.y; y < position.y + height; y++)
        this.buildable[x][y] = false;
  }

  Free(position: Vector3, height: number, width: number) {
    for(let x: number = position.x; x < position.x + width; x++) {
      for(let y: number = position.y; y < position.y + height; y++) {
        this.buildable[x][y] = true;
        this.workable[x][y] = true;
      }
      this.paths.AddPosition(new Vector3(x, position.y, 0));
    }
    
    this.cave.Rebuild(this.workable);
  }

  UpdateCaveTextureOnPosition(position: Vector3, textureId: number) {
    this.cave.UpdateTextureOnPosition(position.x, position.y, textureId);
  }

  Tick(delta: number) {
    this.cave.Tick(delta);
  }
}

export { MapService };