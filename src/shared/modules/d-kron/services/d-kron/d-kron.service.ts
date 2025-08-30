import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';

import {
  FailedToCreateJobException,
  FailedToDeleteJobException,
} from '@shared/modules/d-kron/exceptions/exception-classes';
import { AdditionalJobOptions } from '@shared/modules/d-kron/interfaces/additional-job-options.interface';
import { CronJobScheduleParams } from '@shared/modules/d-kron/interfaces/cron-job-schedule-params.interface';
import { DkronJob } from '@shared/modules/d-kron/interfaces/dkron-job.interface';
import {
  ExecutorHttpMethod,
  HttpExecutorCreateJobData,
} from '@shared/modules/d-kron/interfaces/http-executor-create-job-data.interface';
import { IntervalJobScheduleParams } from '@shared/modules/d-kron/interfaces/interval-job-schedule-params.interface';
import { DKronModuleOptions } from '@shared/modules/d-kron/interfaces/job-scheduler-module-options.interface';
import { ISchedulerJobBody } from '@shared/modules/d-kron/interfaces/scheduler-job-body.interface';
import { SchedulerJob } from '@shared/modules/d-kron/interfaces/scheduler-job.interface';
import { JOB_SCHEDULED_MODULE_OPTIONS } from '@shared/modules/d-kron/providers/job-scheduler-module-options.provider';
import { buildCronJobSchedule } from '@shared/modules/d-kron/utils/build-cron-job-schedule.util';
import { buildIntervalJobSchedule } from '@shared/modules/d-kron/utils/build-interval-job-schedule.util';
import { HttpService } from '@shared/modules/http/services/http/http.service';
import { Logger } from '@shared/modules/logger/loggers/logger';

@Injectable()
export class DKronService {
  private readonly logger = new Logger(DKronService.name);

  constructor(
    @Inject(JOB_SCHEDULED_MODULE_OPTIONS)
    private readonly moduleOptions: DKronModuleOptions,
    private readonly httpService: HttpService,
  ) {}

  async createHttpCronJob(
    name: string,
    scheduleParamsArr: CronJobScheduleParams[],
    jobBody: Omit<ISchedulerJobBody, 'jobName'>,
    options?: AdditionalJobOptions,
  ): Promise<void> {
    const { executeJobEndpoint } = this.moduleOptions;
    const { retriesNumber = 5, expiresAt } = options ?? {};

    const jobBodyWithJobName = {
      ...jobBody,
      jobName: name,
    };

    const jobPayload: HttpExecutorCreateJobData = {
      name,
      schedule: buildCronJobSchedule(scheduleParamsArr),
      expires_at: expiresAt ? expiresAt.toISOString() : undefined,
      executor: 'http',
      executor_config: {
        url: executeJobEndpoint,
        method: ExecutorHttpMethod.POST,
        headers: '["Content-Type: application/json"]',
        body: JSON.stringify(jobBodyWithJobName),
        expectCode: HttpStatus.CREATED.toString(),
      },
      metadata: this.mapJobBodyToMetadata(jobBodyWithJobName),
      retries: retriesNumber,
      disabled: false,
    };

    await this.createJob(jobPayload);
  }

  async createHttpJobForDate(
    name: string,
    date: Date,
    jobBody: Omit<ISchedulerJobBody, 'jobName'>,
    retriesNumber = 5,
  ): Promise<void> {
    const { executeJobEndpoint } = this.moduleOptions;
    const ONE_HOUR = 60 * 60 * 1000;

    const jobBodyWithJobName = {
      ...jobBody,
      jobName: name,
    };

    const jobPayload: HttpExecutorCreateJobData = {
      name,
      schedule: `@at ${date.toISOString()}`,
      expires_at: new Date(date.getTime() + ONE_HOUR).toISOString(),
      ephemeral: true,
      executor: 'http',
      executor_config: {
        url: executeJobEndpoint,
        method: ExecutorHttpMethod.POST,
        headers: '["Content-Type: application/json"]',
        body: JSON.stringify(jobBodyWithJobName),
        expectCode: HttpStatus.CREATED.toString(),
      },
      metadata: this.mapJobBodyToMetadata(jobBodyWithJobName),
      retries: retriesNumber,
      disabled: false,
    };

    await this.createJob(jobPayload);
  }

  async createHttpIntervalJob(
    name: string,
    intervalParams: IntervalJobScheduleParams,
    jobBody: Omit<ISchedulerJobBody, 'jobName'>,
    options?: AdditionalJobOptions,
  ): Promise<void> {
    const { executeJobEndpoint } = this.moduleOptions;
    const { retriesNumber = 5, expiresAt } = options ?? {};

    const jobBodyWithJobName = {
      ...jobBody,
      jobName: name,
    };

    const jobPayload: HttpExecutorCreateJobData = {
      name,
      schedule: buildIntervalJobSchedule(intervalParams),
      expires_at: expiresAt ? expiresAt.toISOString() : undefined,
      executor: 'http',
      executor_config: {
        url: executeJobEndpoint,
        method: ExecutorHttpMethod.POST,
        headers: '["Content-Type: application/json"]',
        body: JSON.stringify(jobBodyWithJobName),
        expectCode: HttpStatus.CREATED.toString(),
      },
      metadata: this.mapJobBodyToMetadata(jobBodyWithJobName),
      retries: retriesNumber,
      disabled: false,
    };

    await this.createJob(jobPayload);
  }

  async createJob(jobPayload: HttpExecutorCreateJobData): Promise<void> {
    const { dKronUrl } = this.moduleOptions;
    const createJobPath = `${dKronUrl}/v1/jobs`;

    const { data } = await this.httpService
      .post<DkronJob>(createJobPath, jobPayload, { retries: 5, retryIntervalMs: 10 })
      .catch(err => {
        throw new FailedToCreateJobException({ cause: err });
      });

    this.logger.verbose(`Job created successfully: ${data.name}`);
  }

  async searchByName(name: string): Promise<SchedulerJob[]> {
    const { dKronUrl } = this.moduleOptions;
    const searchJobsUrl = new URL(`${dKronUrl}/v1/jobs`);
    searchJobsUrl.searchParams.set('q', name);

    const { data } = await this.httpService.get<DkronJob[]>(searchJobsUrl.toString());

    return data.map(dkronJob => {
      return {
        name: dkronJob.name,
        timezone: dkronJob.timezone,
        schedule: dkronJob.schedule,
        retries: dkronJob.retries,
        errorCount: dkronJob.error_count,
        parentJob: dkronJob.parent_job,
        status: dkronJob.status,
        expiresAt: dkronJob.expires_at ? new Date(dkronJob.expires_at) : null,
        lastError: dkronJob.last_error ? new Date(dkronJob.last_error) : null,
        lastSuccess: dkronJob.last_success ? new Date(dkronJob.last_success) : null,
        next: new Date(dkronJob.next),
      };
    });
  }

  async deleteJob(name: string): Promise<void> {
    const { dKronUrl } = this.moduleOptions;
    const deleteJobPath = `${dKronUrl}/v1/jobs/${name}`;

    const response = await this.httpService
      .delete(deleteJobPath, { retries: 5, retryIntervalMs: 10 })
      .catch(err => {
        if (err instanceof HttpException && err.getStatus() === HttpStatus.NOT_FOUND) {
          return null;
        }

        throw new FailedToDeleteJobException({ cause: err });
      });

    if (!response) {
      this.logger.debug(`Job '${name}' is not found to delete`);
      return;
    }

    this.logger.verbose(`Job '${name}' deleted successfully`);
  }

  private mapJobBodyToMetadata(jobBody: Record<string, any>): Record<string, string> {
    const result: Record<string, string> = {};

    for (const [key, value] of Object.entries(jobBody)) {
      if (typeof value === 'string') {
        // eslint-disable-next-line security/detect-object-injection
        result[key] = value;
        continue;
      }
      if (typeof value === 'object') {
        // eslint-disable-next-line security/detect-object-injection
        result[key] = JSON.stringify(value);
        continue;
      }
      if (value === null) {
        // eslint-disable-next-line security/detect-object-injection
        result[key] = '';
      }

      // eslint-disable-next-line security/detect-object-injection
      result[key] = value.toString();
    }

    return result;
  }
}
