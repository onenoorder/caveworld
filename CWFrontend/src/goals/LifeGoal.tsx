import { JobService } from '_services/index';
import { Vector3 } from 'three';
import { IDwarf } from '_entities/dwarfs/index';
import { CompositeGoal, IdleGoal } from '_goals/index';

export class LifeGoal extends CompositeGoal {
  target: Vector3;

  constructor(dwarf: IDwarf) {
    super(dwarf, 'Life');
    this.target = this.dwarf.position;
  }

  WhatsNext() {
    if (this.dwarf.job !== null && this.dwarf.job?.IsCompleted())
      this.dwarf.job = null;

    if (!this.dwarf.job) {
      this.dwarf.job = JobService.Instance.Find(this.dwarf);
      if (this.dwarf.job !== null) {
        this.dwarf.job.AddDwarf(this.dwarf);
      }
    }

    if (!this.dwarf.job) {
      this.subGoals.Push(new IdleGoal(this.dwarf));
    } else {
      let goal = this.dwarf.job.Work(this.dwarf);
      if (goal !== null) {
        this.subGoals.Push(goal);
      }
    }
  }

  Activate() {
    super.Activate();
    this.WhatsNext();
  }

  Run(delta: number): Vector3 {
    let returnValue = super.Run(delta);

    if (this.completed) {
      this.WhatsNext();
      this.completed = false;
    }

    return returnValue;
  }
}