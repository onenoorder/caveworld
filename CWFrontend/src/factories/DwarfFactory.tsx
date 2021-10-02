import { Vector3 } from 'three';
import { IDwarf, RedDwarf, GreenDwarf, BlueDwarf } from '_dwarfs/index';

class DwarfFactory {
  public static Build(dwarfId: number, position: Vector3): IDwarf {
    let dwarf: IDwarf;

    switch(dwarfId) {
      default:
      case 0:
        dwarf = new RedDwarf(position, null);
      break;
      case 1:
        dwarf = new GreenDwarf(position, null);
      break;
      case 2:
        dwarf = new BlueDwarf(position, null);
      break;
    }

    return dwarf;
  }
}

export { DwarfFactory };