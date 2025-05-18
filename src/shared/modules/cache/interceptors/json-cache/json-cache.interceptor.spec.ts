import { FastifyReply, FastifyRequest } from 'fastify';
import Valkey from 'iovalkey';
import { lastValueFrom, of } from 'rxjs';
import { afterEach, expect } from 'vitest';

import { CallHandler, ExecutionContext } from '@nestjs/common';
import { AbstractHttpAdapter, HttpAdapterHost, Reflector } from '@nestjs/core';

import { USER_REQ_PROPERTY } from '@shared/modules/auth/constants/user-req-property';
import { JsonCacheInterceptor } from '@shared/modules/cache/interceptors/json-cache/json-cache.interceptor';
import { CacheConfigService } from '@shared/modules/cache/services/cache-config/cache-config.service';

import { getMockedInstance } from '../../../../../../test/utils/get-mocked-instance.util';

// eslint-disable-next-line max-lines-per-function
describe('JsonCacheInterceptor', () => {
  let interceptor: JsonCacheInterceptor;
  let reflector: Reflector;
  let httpAdapterHost: HttpAdapterHost;
  let ioValkeyInstance: Valkey;
  let context: ExecutionContext;
  let next: CallHandler;

  beforeEach(() => {
    reflector = getMockedInstance(Reflector);
    httpAdapterHost = {
      httpAdapter: {
        getRequestMethod: vi.fn(),
        getRequestUrl: vi.fn().mockReturnValue('/test-url'),
      } as unknown as AbstractHttpAdapter,
    } as unknown as HttpAdapterHost;

    ioValkeyInstance = getMockedInstance(Valkey);
    vi.spyOn(CacheConfigService, 'getIoValkeyInstance').mockReturnValue(ioValkeyInstance);

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

      vi.spyOn(ioValkeyInstance, 'get').mockResolvedValue(cachedValue);

      const result$ = await interceptor.intercept(context, next);
      const resultPromise = await lastValueFrom(result$);

      expect(resultPromise).toEqual(cachedValue);
      expect(ioValkeyInstance.get).toHaveBeenCalledWith('user_123:/test-url');
    });

    it('should call next.handle() and do not set cache if request is not cacheable', async () => {
      vi.spyOn(ioValkeyInstance, 'get').mockResolvedValue(null);
      vi.spyOn(ioValkeyInstance, 'set').mockResolvedValue('OK');

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

      vi.spyOn(interceptor as any, 'getCacheKey').mockReturnValueOnce(MOCK_URL);
      vi.spyOn(reflector, 'get').mockReturnValue(MOCK_MANUAL_TTL);
      vi.spyOn(ioValkeyInstance, 'get').mockResolvedValue(null);
      vi.spyOn(ioValkeyInstance, 'set').mockResolvedValue('OK');

      const result$ = await interceptor.intercept(context, next);
      const resultPromise = await lastValueFrom(result$);

      expect(resultPromise).toEqual({ data: 'test' });
      expect(ioValkeyInstance.get).toHaveBeenCalledWith(MOCK_URL);
      expect(ioValkeyInstance.setex).toHaveBeenCalledWith(
        'user_123:/test-url',
        MOCK_MANUAL_TTL,
        `{"data":"test"}`,
      );
    });

    it('should call next.handle() and set cache without manual TTL if no cached value', async () => {
      vi.spyOn(ioValkeyInstance, 'get').mockResolvedValue(null);
      vi.spyOn(ioValkeyInstance, 'set').mockResolvedValue('OK');

      const result$ = await interceptor.intercept(context, next);
      const resultPromise = await lastValueFrom(result$);

      expect(resultPromise).toEqual({ data: 'test' });
      expect(ioValkeyInstance.get).toHaveBeenCalledWith('user_123:/test-url');
      expect(ioValkeyInstance.set).toHaveBeenCalledWith(
        'user_123:/test-url',
        `{"data":"test"}`,
      );
    });

    it('should proceed without cache if key is not present', async () => {
      vi.spyOn(interceptor as any, 'getCacheKey').mockReturnValue(undefined);

      const result$ = await interceptor.intercept(context, next);
      const resultPromise = await lastValueFrom(result$);

      expect(resultPromise).toEqual({ data: 'test' });
      expect(ioValkeyInstance.get).not.toHaveBeenCalled();
      expect(ioValkeyInstance.set).not.toHaveBeenCalled();
    });

    it('should handle exceptions and proceed without cache', async () => {
      vi.spyOn(ioValkeyInstance, 'get').mockRejectedValue(new Error('Valkey error'));

      const result$ = await interceptor.intercept(context, next);
      const resultPromise = await lastValueFrom(result$);

      expect(resultPromise).toEqual({ data: 'test' });
      expect(ioValkeyInstance.get).toHaveBeenCalledWith('user_123:/test-url');
    });
  });
});
