import { MapService } from '_services/index';
import { Vector3 } from 'three';
import { IDwarf } from '_entities/dwarfs/index';
import { CompositeGoal, FollowPathGoal } from '_goals/index';

export class CraftStairGoal extends CompositeGoal {
  target: Vector3;
  startPosition: Vector3;
  digProgress: number = 0;
  lastDig: number = 0;
  direction: number;
  starting: boolean = true;

  constructor(dwarf: IDwarf, target: Vector3, startPosition: Vector3) {
    super(dwarf, 'Dig');
    this.target = target;
    this.startPosition = startPosition;
    this.direction = this.startPosition.x > this.target.x ? -1 : 1;
    this.state = 12;
  }

  Activate() {
    super.Activate();

    let from = this.dwarf.position.clone();
    from.x = Math.floor(from.x);
    from.y = Math.floor(from.y);
    from.z = 0;

    this.subGoals.Push(new FollowPathGoal(this.dwarf, MapService.Instance.paths.ShortestUnweightedPath(from, this.startPosition)));
    this.completed = false;
  }

  GetName(): string {
    if (this.subGoals.Size() > 0) {
      return super.GetName();
    } else if (this.starting) {
      return 'DigDown';
    } else {
      return this.direction < 0 ? 'DigDown' : 'DigUp';
    }
  }

  GetCaveTexture(): number {
    if (this.direction > 0) {
      return 160 + this.digProgress / 14;
    } else {
      return 144 + this.digProgress / 14;
    }
  }

  Dig() {
    this.digProgress += 1;
    this.lastDig = 0;
    this.state += 1;
    if (this.state > 14)
      this.state = 0;
    if (this.state > 0 && this.state < 4) {
      this.dwarf.position.x += this.direction * 0.025;
      MapService.Instance.UpdateCaveTextureOnPosition(this.target, this.GetCaveTexture());
    }
  }

  Run(delta: number): Vector3 {
    let returnValue = super.Run(delta);

    if (this.completed && ((this.direction > 0 && this.dwarf.position.x >= this.startPosition.x) ||
      (this.direction < 0 && this.dwarf.position.x <= this.startPosition.x))) {
      this.lastDig += delta;

      if (this.starting && this.lastDig > 0.5) {
        this.lastDig = 0;
        this.state += this.direction * -1;
        if (this.state < 10 || this.state > 14) {
          this.starting = false;
          this.state = 0;
        }
      } else if (!this.starting && this.lastDig > 0.2) {
        this.Dig();
      }

      this.completed = this.digProgress === 140;
      if (this.completed) {
        MapService.Instance.Free(this.target, 1, 1);
      }
    } else if (this.completed) {
      this.Activate();
    }

    return returnValue;
  }
}