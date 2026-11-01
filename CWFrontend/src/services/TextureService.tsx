import { Texture, TextureLoader } from 'three';
import { DwarfKind } from '_utilities/Enums';

class TextureService {
  textures: Map<string, Texture>;
  loaded: Map<string, boolean>;
  texturesMap: string = 'textures/';
  buildingsMap: string = 'buildings/';
  excavationMaskTexturePrefix: string = 'excavation/ExcavationMask';
  scaffoldTexturePrefix: string = 'construction/Scaffold';
  dwarfsMap: string = 'dwarf/';
  dwarfsKinds: DwarfKind[] = [DwarfKind.BLUE, DwarfKind.GREEN, DwarfKind.RED];
  dwarfsAnimations: { name: string, frames: number }[] = [
    { name: 'Climb', frames: 4 },
    { name: 'DigDown', frames: 21 },
    { name: 'DigLeft', frames: 15 },
    { name: 'DigRight', frames: 15 },
    { name: 'DigUp', frames: 20 },
    { name: 'Idle', frames: 5 },
    { name: 'Turn', frames: 12 },
    { name: 'WalkLeft', frames: 12 },
    { name: 'WalkRight', frames: 12 }
  ];

  public static Instance: TextureService;

  private constructor() {
    this.textures = new Map<string, Texture>();
    this.loaded = new Map<string, boolean>();
  }

  public static Setup() {
    if (TextureService.Instance)
      TextureService.Instance.Destroy();

    TextureService.Instance = new TextureService();
    TextureService.Instance.PreloadDwarfTextures();
  }

  PreloadDwarfTextures() {
    this.dwarfsKinds.forEach(kind => {
      this.dwarfsAnimations.forEach(animation => {
        for (let frame = 0; frame < animation.frames; frame++) {
          this.GetDwarfTexture(kind, animation.name, frame);
        }
      });
    });
  }

  GetTexture(name: string): Texture {
    if (this.textures.has(name)) {
      return this.textures.get(name) as Texture;
    } else {
      this.loaded.set(name, false);
      let texture = new TextureLoader().load(this.texturesMap + name + '.png', () => {
        this.loaded.set(name, true);
      });
      this.textures.set(name, texture);
      return texture;
    }
  }

  GetBuildingTexture(name: string): Texture {
    return this.GetTexture(this.buildingsMap + name);
  }

  GetBuildingTextureWithState(name: string, state: number): Texture {
    if (state === 4) {
      return this.GetBuildingTexture(name);
    } else {
      return this.GetBuildingTexture(name + state.toString());
    }
  }

  IsLoaded(name: string): boolean {
    return this.loaded.get(name) || false;
  }

  GetExcavationTexture(number: number): Texture {
    return this.GetTexture(this.excavationMaskTexturePrefix + number.toString());
  }

  IsExcavationLoaded(number: number): boolean {
    return this.loaded.get(this.excavationMaskTexturePrefix + number.toString()) || false;
  }

  GetScaffoldTexture(number: number): Texture {
    return this.GetTexture(this.scaffoldTexturePrefix + number.toString());
  }

  GetDwarfTexture(kind: string, job: string, number: number): Texture {
    return this.GetTexture(this.dwarfsMap + kind + '/' + job + number.toString());
  }

  Destroy() {
    this.textures.forEach(texture => {
      texture.dispose();
    });
    this.textures.clear();
    this.loaded.clear();
  }
}

export { TextureService };