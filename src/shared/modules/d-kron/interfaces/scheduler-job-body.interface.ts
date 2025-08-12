export interface ISchedulerJobBody {
  jobName: string;
  // Type of job for example 'check-intake-taken'
  jobType: string;
  // Stringified JSON
  payload: Record<string, any>;
}
