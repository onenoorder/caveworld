import { IDwarf } from "entities/dwarfs";
import { Vector3 } from "three";
import { Job } from "_jobs/index";
import { MapService } from "_services/index";

class IdleJob {
  mapService: MapService;
  pointOfInterest: Vector3;
  timePast: number = 0;
  timeInterval: number = 0;

  constructor(dwarf: IDwarf | null, mapService: MapService) {
    //super(dwarf, 'Idle', 0);
    this.mapService = mapService;

    this.pointOfInterest = new Vector3();
  }

  SetDwarf(dwarf: IDwarf) {
    //super.SetDwarf(dwarf);
    this.pointOfInterest = dwarf.position;
  }

  FindNewPointOfInteres() {
    let direction = Math.floor(Math.random() * 2);
    let max = Math.floor(Math.random() * 10) + 1;

    if (direction === 0) {
      for(let x: number = this.pointOfInterest.x + max; x > this.pointOfInterest.x; x--) {
        let newPoint = this.pointOfInterest.clone();
        newPoint.x = Math.floor(x);
        if (this.mapService.CanBeReached(newPoint)) {
          this.pointOfInterest = newPoint;
          break;
        }
      }
    } else {
      for(let x: number = this.pointOfInterest.x - max; x < this.pointOfInterest.x; x++) {
        let newPoint = this.pointOfInterest.clone();
        newPoint.x = Math.floor(x);
        if (this.mapService.CanBeReached(newPoint)) {
          this.pointOfInterest = newPoint;
          break;
        }
      }
    }
  }

  Move(dwarf: IDwarf, delta: number) {
    let x = dwarf.position.x;
    let y = dwarf.position.y;
    let z = dwarf.position.z;
    let velocity = dwarf.velocity;

    if (x !== this.pointOfInterest.x || y !== this.pointOfInterest.y) {
      if (z !== this.mapService.walkLevel) {
        if (velocity.z <= 0)
          velocity.z = dwarf.speed.z;

        if (z + velocity.z * delta >= this.mapService.walkLevel) {
          velocity.z = 0;
          dwarf.position.z = this.mapService.walkLevel;
        } else {
          dwarf.position.z += velocity.z * delta;
        }
      } else {
        if (x < this.pointOfInterest.x) {
          if (velocity.x <= 0)
            velocity.x = dwarf.speed.x;
    
          if (x + velocity.x * delta >= this.pointOfInterest.x) {
            velocity.x = 0;
            dwarf.position.x = this.pointOfInterest.x;
          } else {
            dwarf.position.x += velocity.x * delta;
          }
        } else if (x > this.pointOfInterest.x) {
          if (velocity.x >= 0)
            velocity.x = -dwarf.speed.x;
    
          if (x - velocity.x * delta <= this.pointOfInterest.x) {
            velocity.x = 0;
            dwarf.position.x = this.pointOfInterest.x;
          } else {
            dwarf.position.x += velocity.x * delta;
          }
        } else {
          if (velocity.x === 0)
            velocity.x = dwarf.speed.x;
        }
      }
    } else {
      if (z !== 0) {
        if (velocity.z >= 0)
          velocity.z = -dwarf.speed.z;

        if (z + velocity.z * delta <= 0) {
          velocity.z = 0;
          dwarf.position.z = 0;
        } else {
          dwarf.position.z += velocity.z * delta;
        }
      }
    }
  }

  NewTimeInterval() {
    this.timeInterval = Math.floor(Math.random() * 100) + 40;
  }

  Work(delta: number): void {
    this.timePast += delta;

    if (this.timePast > this.timeInterval) {
      this.FindNewPointOfInteres();
      this.timePast = 0;
      this.NewTimeInterval();
    }

    //if (this.dwarf)
    //  this.Move(this.dwarf, delta);
    
  }
}

export { IdleJob };