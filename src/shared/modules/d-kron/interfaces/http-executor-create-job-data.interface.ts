import { CreateJobDataBasic } from '@shared/modules/d-kron/interfaces/create-job-data.interface';

export interface HttpExecutorCreateJobData extends CreateJobDataBasic {
  executor: 'http';
  executor_config: HttpExecutorConfig;
}

export interface HttpExecutorConfig {
  url: string;
  method: ExecutorHttpMethod;
  headers?: string; // JSON string representing headers
  body?: string; // JSON string representing the request body (optional for POST/PUT methods)
  timeout?: string; // stringified number
  expectCode?: string; // stringified number
  expectBody?: string;
}

export enum ExecutorHttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
}
