export interface SchedulerJob {
  name: string;
  timezone: string;
  schedule: string;
  errorCount: number;
  lastSuccess: Date | null;
  lastError: Date | null;
  retries: number;
  parentJob: string;
  status: string;
  next: Date;
  expiresAt: Date | null;
}
