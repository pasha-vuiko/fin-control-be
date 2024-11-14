import { FastifyReply, FastifyRequest } from 'fastify';
import Redis from 'ioredis';
import { lastValueFrom, of } from 'rxjs';
import { afterEach, expect } from 'vitest';

import { CallHandler, ExecutionContext } from '@nestjs/common';
import { AbstractHttpAdapter, HttpAdapterHost, Reflector } from '@nestjs/core';

import { USER_REQ_PROPERTY } from '@shared/modules/auth/constants/user-req-property';
import { JsonCacheInterceptor } from '@shared/modules/redis/interceptors/json-cache/json-cache.interceptor';
import { RedisConfigService } from '@shared/modules/redis/services/redis-config/redis-config.service';

import { getMockedInstance } from '../../../../../../test/utils/get-mocked-instance.util';

// eslint-disable-next-line max-lines-per-function
describe('JsonCacheInterceptor', () => {
  let interceptor: JsonCacheInterceptor;
  let reflector: Reflector;
  let httpAdapterHost: HttpAdapterHost;
  let ioRedisInstance: Redis;
  let context: ExecutionContext;
  let next: CallHandler;

  beforeEach(() => {
    reflector = getMockedInstance(Reflector);
    httpAdapterHost = {
      httpAdapter: {
        getRequestMethod: vi.fn(),
        getRequestUrl: vi.fn().mockReturnValue('/test-url'),
      } as unknown as AbstractHttpAdapter,
    };

    ioRedisInstance = getMockedInstance(Redis);
    vi.spyOn(RedisConfigService, 'getIoRedisInstance').mockReturnValue(ioRedisInstance);

    interceptor = new JsonCacheInterceptor(reflector, httpAdapterHost, {});
    context = {
      switchToHttp: () => ({
        getRequest: (): FastifyRequest =>
          ({
            method: 'GET',
            [USER_REQ_PROPERTY]: { sub: '123' },
          }) as unknown as FastifyRequest,
        getResponse: (): FastifyReply => ({ header: vi.fn() }) as unknown as FastifyReply,
      }),
      getHandler: () => {},
    } as any;

    next = {
      handle: vi.fn().mockReturnValue(of({ data: 'test' })),
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // eslint-disable-next-line max-lines-per-function
  describe('intercept()', () => {
    it('should return cached value if present', async () => {
      const cachedValue = `{"data":"test"}`;

      vi.spyOn(ioRedisInstance, 'get').mockResolvedValue(cachedValue);

      const result$ = await interceptor.intercept(context, next);
      const resultPromise = await lastValueFrom(result$);

      expect(resultPromise).toEqual(cachedValue);
      expect(ioRedisInstance.get).toHaveBeenCalledWith('user_123:/test-url');
    });

    it('should call next.handle() and do not set cache if request is not cacheable', async () => {
      vi.spyOn(ioRedisInstance, 'get').mockResolvedValue(null);
      vi.spyOn(ioRedisInstance, 'set').mockResolvedValue('OK');

      const localContext = {
        switchToHttp: () => ({
          getRequest: (): FastifyRequest =>
            ({
              method: 'POST',
            }) as unknown as FastifyRequest,
        }),
        getHandler: () => {},
      } as any;

      const result$ = await interceptor.intercept(localContext, next);
      const resultPromise = await lastValueFrom(result$);

      expect(resultPromise).toEqual({ data: 'test' });
    });

    it('should call next.handle() and set cache with manual TTL if no cached value', async () => {
      const MOCK_URL = 'user_123:/test-url';
      const MOCK_MANUAL_TTL = 60;

      vi.spyOn(interceptor as any, 'getCacheKey').mockReturnValueOnce(undefined);
      vi.spyOn(interceptor as any, 'getCacheKey').mockReturnValueOnce(MOCK_URL);
      vi.spyOn(reflector, 'get').mockReturnValue(MOCK_MANUAL_TTL);
      vi.spyOn(ioRedisInstance, 'get').mockResolvedValue(null);
      vi.spyOn(ioRedisInstance, 'set').mockResolvedValue('OK');

      const result$ = await interceptor.intercept(context, next);
      const resultPromise = await lastValueFrom(result$);

      expect(resultPromise).toEqual({ data: 'test' });
      expect(ioRedisInstance.get).toHaveBeenCalledWith(MOCK_URL);
      expect(ioRedisInstance.setex).toHaveBeenCalledWith(
        'user_123:/test-url',
        MOCK_MANUAL_TTL,
        `{"data":"test"}`,
      );
    });

    it('should call next.handle() and set cache without manual TTL if no cached value', async () => {
      vi.spyOn(ioRedisInstance, 'get').mockResolvedValue(null);
      vi.spyOn(ioRedisInstance, 'set').mockResolvedValue('OK');

      const result$ = await interceptor.intercept(context, next);
      const resultPromise = await lastValueFrom(result$);

      expect(resultPromise).toEqual({ data: 'test' });
      expect(ioRedisInstance.get).toHaveBeenCalledWith('user_123:/test-url');
      expect(ioRedisInstance.set).toHaveBeenCalledWith(
        'user_123:/test-url',
        `{"data":"test"}`,
      );
    });

    it('should proceed without cache if key is not present', async () => {
      vi.spyOn(interceptor as any, 'getCacheKey').mockReturnValue(undefined);

      const result$ = await interceptor.intercept(context, next);
      const resultPromise = await lastValueFrom(result$);

      expect(resultPromise).toEqual({ data: 'test' });
      expect(ioRedisInstance.get).not.toHaveBeenCalled();
      expect(ioRedisInstance.set).not.toHaveBeenCalled();
    });

    it('should handle exceptions and proceed without cache', async () => {
      vi.spyOn(ioRedisInstance, 'get').mockRejectedValue(new Error('Redis error'));

      const result$ = await interceptor.intercept(context, next);
      const resultPromise = await lastValueFrom(result$);

      expect(resultPromise).toEqual({ data: 'test' });
      expect(ioRedisInstance.get).toHaveBeenCalledWith('user_123:/test-url');
    });
  });
});
