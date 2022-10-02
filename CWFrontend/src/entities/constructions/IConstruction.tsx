import { IJob } from '_jobs/index';
import { ITickableEntity, IWithTextureService } from '_entities/index';
import { ConstructionType, Direction } from '_utilities/Enums';

interface IConstruction extends ITickableEntity, IWithTextureService {
	job: IJob;
  height: number;
	width: number;
  direction: Direction;
  constructionType: ConstructionType;

  IsCompleted(): boolean;
}

export type { IConstruction };