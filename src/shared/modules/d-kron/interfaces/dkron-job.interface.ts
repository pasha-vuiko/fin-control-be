export interface DkronJob {
  id: string;
  name: string;
  displayname: string;
  timezone: string;
  schedule: string;
  owner: string;
  owner_email: string;
  success_count: number;
  error_count: number;
  last_success: string | null; // ISO date string
  last_error: string | null; // ISO date string
  disabled: boolean;
  tags: any | null; // If tags is a more specific structure, define it. Otherwise, use `any`.
  metadata: Record<string, string>;
  retries: number;
  dependent_jobs: any | null;
  parent_job: string;
  processors: Record<string, unknown>; // Empty object, can be expanded based on need
  concurrency: 'allow' | 'forbid'; // Based on DKron's concurrency options
  executor: string; // Executor type, e.g., 'http'
  executor_config: {
    body: string; // JSON string
    headers: string; // JSON string
    method: 'POST' | 'GET' | 'PUT' | 'DELETE'; // HTTP method
    url: string;
  };
  status: 'success' | 'error' | 'running' | 'queued' | string; // Status of the job
  next: string; // ISO date string representing the next scheduled execution
  ephemeral: boolean;
  expires_at: string | null; // ISO date string or null if not set
}
