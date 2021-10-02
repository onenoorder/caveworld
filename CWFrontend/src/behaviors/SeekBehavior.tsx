import { Vector3 } from 'three';
import { Behavior } from '_behaviors/index';

class SeekBehavior extends Behavior {
  Execute(target: Vector3): Vector3 {
    let velocity = new Vector3(0, 0, 0);
    if (this.dwarf.velocity.x > this.dwarf.speed.x) {
      return velocity;
    } else if (this.dwarf.velocity.y > this.dwarf.speed.y) {
      return velocity;
    } else if (this.dwarf.velocity.z > this.dwarf.speed.z) {
      return velocity;
    }

    let desiredVelocity = target.min(this.dwarf.position);

    if (desiredVelocity.x > this.dwarf.maxSpeed.x)
      desiredVelocity.x = this.dwarf.maxSpeed.x;

    desiredVelocity.z = 0;
    desiredVelocity.y = 0;

    this.dwarf.velocityCalculate.add(desiredVelocity);
    
    return desiredVelocity;
  }
}

export { SeekBehavior };