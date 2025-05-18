import { FastifyReply, FastifyRequest } from 'fastify';
import Valkey from 'iovalkey';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

import { CACHE_KEY_METADATA, CACHE_TTL_METADATA } from '@nestjs/cache-manager';
import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { isFunction, isNil } from '@nestjs/common/utils/shared.utils';
import { HttpAdapterHost, Reflector } from '@nestjs/core';

import { USER_REQ_PROPERTY } from '@shared/modules/auth/constants/user-req-property';
import { IAuth0User } from '@shared/modules/auth/interfaces/auth0-user.interface';
import { ICacheModuleOptions } from '@shared/modules/cache/interfaces/cache-module-options.interface';
import { CACHE_MODULE_OPTIONS } from '@shared/modules/cache/providers/cache-module-options.provider';
import { CacheConfigService } from '@shared/modules/cache/services/cache-config/cache-config.service';
import { Logger } from '@shared/modules/logger/loggers/logger';
import { createAsyncCacheDedupe } from '@shared/utils/create-async-cache-dedupe';

@Injectable()
export class JsonCacheInterceptor implements NestInterceptor {
  private ioValkeyInstance: Valkey;
  private logger = new Logger(JsonCacheInterceptor.name);
  private readonly getCachedResponse: (key: string) => Promise<string | null>;

  protected allowedMethods = ['GET'];

  constructor(
    protected readonly reflector: Reflector,
    protected readonly httpAdapterHost: HttpAdapterHost,
    @Inject(CACHE_MODULE_OPTIONS) private moduleOptions: ICacheModuleOptions,
  ) {
    this.ioValkeyInstance = CacheConfigService.getIoValkeyInstance();
    this.getCachedResponse = createAsyncCacheDedupe(key =>
      this.ioValkeyInstance.get(key),
    );
  }

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const key = this.getCacheKey(context);

    if (!key) {
      return next.handle();
    }

    try {
      const value = await this.getCachedResponse(key);
      const reply: FastifyReply | null = context.switchToHttp().getResponse();

      this.setHeadersWhenHttp(reply, value);

      if (!isNil(value)) {
        if (reply) {
          reply.header('content-type', 'application/json; charset=utf-8');
        }

        return of(value);
      }

      const ttlValueOrFactory =
        this.reflector.get(CACHE_TTL_METADATA, context.getHandler()) ?? null;

      const ttl: number =
        (isFunction(ttlValueOrFactory)
          ? await ttlValueOrFactory(context)
          : ttlValueOrFactory) ?? this.moduleOptions.ttl;

      return next.handle().pipe(tap(response => void this.setCache(response, key, ttl)));
    } catch {
      return next.handle();
    }
  }

  private getCacheKey(context: ExecutionContext): string | undefined {
    const request = context.switchToHttp().getRequest();

    if (!this.isRequestCacheable(request)) {
      return undefined;
    }

    const httpAdapter = this.httpAdapterHost.httpAdapter;
    const isHttpApp = httpAdapter && !!httpAdapter.getRequestMethod;
    const cacheMetadata = this.reflector.get(CACHE_KEY_METADATA, context.getHandler());

    // eslint-disable-next-line security/detect-object-injection
    const user: IAuth0User | undefined = request[USER_REQ_PROPERTY];
    const userId = user?.sub;
    const cacheKeyPrefix = userId ? `user_${userId}:` : 'publicUser:';

    if (!isHttpApp || cacheMetadata) {
      return cacheKeyPrefix + cacheMetadata;
    }

    const reqUrl = httpAdapter.getRequestUrl(request);

    return cacheKeyPrefix + reqUrl;
  }

  protected isRequestCacheable(request: FastifyRequest): boolean {
    return this.allowedMethods.includes(request.method);
  }

  private setHeadersWhenHttp<T>(reply: FastifyReply | null, value: T | null): void {
    if (!reply) {
      return;
    }

    reply.header('x-cache', isNil(value) ? 'MISS' : 'HIT');
  }

  private async setCache(responseBody: any, key: string, ttl?: number): Promise<void> {
    const serializedResponseBody = this.serializeResponseBody(responseBody);

    try {
      if (typeof ttl === 'number') {
        await this.ioValkeyInstance.setex(key, ttl, serializedResponseBody);

        return;
      }

      await this.ioValkeyInstance.set(key, serializedResponseBody);
    } catch (err: Error | any) {
      this.logger.error(
        `An error has occurred when inserting "key: ${key}", "value: ${responseBody}"`,
        err,
      );
    }
  }

  private serializeResponseBody(response: any): string | number {
    if (typeof response === 'string' || typeof response === 'number') {
      const errMsg = `@${JsonCacheInterceptor.name}() decorator can be used to cache only JSON response bodies, consider to use @UseInterceptors(CacheInterceptor) instead`;

      throw new Error(errMsg);
    }

    try {
      return JSON.stringify(response);
    } catch {
      throw new Error('Failed to stringify response');
    }
  }
}
