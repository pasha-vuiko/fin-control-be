export interface CreateJobDataBasic {
  name: string;
  displayname?: string;
  parent_job?: string;
  schedule: string;
  timezone?: string;
  executor: 'http' | 'kafka' | 'nats' | 'shell';
  executor_config: any;
  expires_at?: string;
  // specifies if the job should be deleted after success execution
  ephemeral?: boolean;
  owner?: string;
  owner_email?: string;
  metadata?: Record<string, string | null>;
  tags?: Record<string, any>;
  // 'allow' is default
  concurrency?: 'allow' | 'forbid';
  retries: number;
  disabled: boolean;
}
