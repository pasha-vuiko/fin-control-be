export interface ISchedulerJobBody {
  jobName: string;
  // Type of job, for example, 'apply-regular-payment'
  jobType: string;
  // Stringified JSON
  payload: Record<string, any>;
}
