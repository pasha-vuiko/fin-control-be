import { IsNotEmpty, IsObject, IsString } from 'class-validator';

import { ISchedulerJobBody } from '@shared/modules/d-kron/interfaces/scheduler-job-body.interface';

export class JobExecutionDto implements ISchedulerJobBody {
  @IsString()
  @IsNotEmpty()
  jobName: string;

  @IsString()
  @IsNotEmpty()
  jobType: string;

  @IsObject()
  payload: Record<string, any>;
}
