import { HttpException, HttpStatus } from '@nestjs/common';

import { HttpService } from '@shared/modules/http/services/http/http.service';

import { getMockedInstance } from '../../../../../../test/utils/get-mocked-instance.util';
import {
  FailedToCreateJobException,
  FailedToDeleteJobException,
} from '../../exceptions/exception-classes';
import { DKronService } from './d-kron.service';

// eslint-disable-next-line max-lines-per-function
describe('DKronService', () => {
  let service: DKronService;
  let httpService: HttpService;
  const moduleOptions = {
    dKronUrl: 'http://dkron.local',
    executeJobEndpoint: 'http://api.local/jobs/execute',
  };

  beforeEach(async () => {
    httpService = getMockedInstance(HttpService);
    service = new DKronService(moduleOptions, httpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createHttpCronJob()', () => {
    it('builds cron payload and calls createJob()', async () => {
      const name = 'job-1';
      const scheduleParams = [{ minute: 5, hour: 1, dayOfMonth: 10 }];
      const jobBody = { jobType: 'regular-payment-apply', payload: { id: 1 } };
      const expectedSchedule = '* 5 1 10 * *';

      const serviceCreateJobSpy = vi
        .spyOn(service, 'createJob')
        .mockResolvedValueOnce(undefined as unknown as void);

      await service.createHttpCronJob(name, scheduleParams, jobBody);

      expect(serviceCreateJobSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          name,
          schedule: expectedSchedule,
          executor: 'http',
          executor_config: expect.objectContaining({
            url: moduleOptions.executeJobEndpoint,
            method: 'POST',
            headers: '["Content-Type: application/json"]',
            body: expect.stringContaining('"jobName":"job-1"'),
            expectCode: HttpStatus.CREATED.toString(),
          }),
          metadata: expect.objectContaining({ jobType: jobBody.jobType }),
          retries: 5,
          disabled: false,
        }),
      );
    });
  });

  describe('createHttpJobForDate()', () => {
    it('builds one-shot payload with @at schedule and expiry', async () => {
      const name = 'job-at';
      const date = new Date('2024-02-01T10:00:00.000Z');
      const jobBody = { jobType: 'x', payload: { a: 1 } };
      const ONE_HOUR = 60 * 60 * 1000;

      const serviceCreateJobSpy = vi
        .spyOn(service, 'createJob')
        .mockResolvedValueOnce(undefined as unknown as void);

      await service.createHttpJobForDate(name, date, jobBody);

      expect(serviceCreateJobSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          name,
          schedule: `@at ${date.toISOString()}`,
          expires_at: new Date(date.getTime() + ONE_HOUR).toISOString(),
          ephemeral: true,
          executor_config: expect.objectContaining({
            url: moduleOptions.executeJobEndpoint,
          }),
        }),
      );
    });
  });

  describe('createHttpIntervalJob()', () => {
    it('builds interval schedule and options', async () => {
      const name = 'job-interval';
      const interval = { minutes: 15, seconds: 5 };
      const jobBody = { jobType: 'y', payload: { b: 2 } };
      const options = {
        retriesNumber: 3,
        expiresAt: new Date('2025-01-01T00:00:00.000Z'),
      };

      const serviceCreateJobSpy = vi
        .spyOn(service, 'createJob')
        .mockResolvedValueOnce(undefined as unknown as void);

      await service.createHttpIntervalJob(name, interval, jobBody, options);

      expect(serviceCreateJobSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          name,
          schedule: '@every 15m 5s',
          expires_at: options.expiresAt.toISOString(),
          retries: options.retriesNumber,
          executor_config: expect.objectContaining({
            url: moduleOptions.executeJobEndpoint,
          }),
        }),
      );
    });
  });

  // eslint-disable-next-line max-lines-per-function
  describe('createJob()', () => {
    it('posts to dkron and resolves on success', async () => {
      const payload = {
        name: 'any',
        schedule: '* * * * * *',
        executor: 'http',
        executor_config: {
          url: moduleOptions.executeJobEndpoint,
          method: 'POST',
          headers: '[]',
          body: '{}',
          expectCode: '201',
        },
        metadata: {},
        retries: 1,
        disabled: false,
      } as any;

      const httpPostSpy = vi.spyOn(httpService, 'post').mockResolvedValueOnce({
        data: { name: payload.name },
      } as any);

      await service.createJob(payload);

      expect(httpPostSpy).toHaveBeenCalledWith(
        `${moduleOptions.dKronUrl}/v1/jobs`,
        payload,
        { retries: 5, retryIntervalMs: 10 },
      );
    });

    it('wraps errors in FailedToCreateJobException', async () => {
      const httpPostSpy = vi
        .spyOn(httpService, 'post')
        .mockRejectedValueOnce(new Error('boom'));

      await expect(service.createJob({} as any)).rejects.toBeInstanceOf(
        FailedToCreateJobException,
      );

      expect(httpPostSpy).toHaveBeenCalled();
    });
  });

  // eslint-disable-next-line max-lines-per-function
  describe('searchByName()', () => {
    // eslint-disable-next-line max-lines-per-function
    it('queries dkron and maps results', async () => {
      const name = 'some-job';
      const next = new Date('2024-05-05T00:00:00.000Z').toISOString();
      const last_success = new Date('2024-05-01T00:00:00.000Z').toISOString();
      const last_error = null;
      const expires_at = null;
      vi.spyOn(httpService, 'get').mockResolvedValueOnce({
        data: [
          {
            id: '1',
            name,
            displayname: name,
            timezone: 'UTC',
            schedule: '* * * * * *',
            owner: '',
            owner_email: '',
            success_count: 1,
            error_count: 0,
            last_success,
            last_error,
            disabled: false,
            tags: null,
            metadata: {},
            retries: 5,
            dependent_jobs: null,
            parent_job: 'root',
            processors: {},
            concurrency: 'allow',
            executor: 'http',
            executor_config: { body: '{}', headers: '[]', method: 'POST', url: '' },
            status: 'success',
            next,
            ephemeral: false,
            expires_at,
          },
        ],
      } as any);

      const results = await service.searchByName(name);

      expect(results).toHaveLength(1);
      expect(results[0]).toEqual({
        name,
        timezone: 'UTC',
        schedule: '* * * * * *',
        retries: 5,
        errorCount: 0,
        parentJob: 'root',
        status: 'success',
        expiresAt: null,
        lastError: null,
        lastSuccess: new Date(last_success),
        next: new Date(next),
      });
    });
  });

  describe('deleteJob()', () => {
    it('calls delete and logs when not found', async () => {
      vi.spyOn(httpService, 'delete').mockRejectedValueOnce(
        new HttpException('not found', HttpStatus.NOT_FOUND),
      );

      await expect(service.deleteJob('missing')).resolves.toBeUndefined();
    });

    it('wraps unknown errors in FailedToDeleteJobException', async () => {
      vi.spyOn(httpService, 'delete').mockRejectedValueOnce(new Error('boom'));

      await expect(service.deleteJob('name')).rejects.toBeInstanceOf(
        FailedToDeleteJobException,
      );
    });

    it('resolves when deletion succeeds', async () => {
      const httpDeleteSpy = vi
        .spyOn(httpService, 'delete')
        .mockResolvedValueOnce({} as any);

      await expect(service.deleteJob('name')).resolves.toBeUndefined();
      expect(httpDeleteSpy).toHaveBeenCalledWith(
        `${moduleOptions.dKronUrl}/v1/jobs/name`,
        { retries: 5, retryIntervalMs: 10 },
      );
    });
  });
});
