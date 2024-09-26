import { FastifyReply, FastifyRequest } from 'fastify';
import Redis from 'ioredis';
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

import { IAuth0User } from '@shared/modules/auth/interfaces/auth0-user.interface';
import { Logger } from '@shared/modules/logger/loggers/logger';
import { IRedisModuleOptions } from '@shared/modules/redis/interfaces/redis-module-options.interface';
import { REDIS_MODULE_OPTIONS } from '@shared/modules/redis/providers/redis-module-options.provider';
import { RedisConfigService } from '@shared/modules/redis/services/redis-config/redis-config.service';
import { createAsyncCacheDedupe } from '@shared/utils/create-async-cache-dedupe';

@Injectable()
export class JsonCacheInterceptor implements NestInterceptor {
  private ioRedisInstance: Redis;
  private logger = new Logger(JsonCacheInterceptor.name);
  private readonly getCachedResponse: (key: string) => Promise<string | null>;

  protected allowedMethods = ['GET'];

  constructor(
    protected readonly reflector: Reflector,
    protected readonly httpAdapterHost: HttpAdapterHost,
    @Inject(REDIS_MODULE_OPTIONS) private moduleOptions: IRedisModuleOptions,
  ) {
    this.ioRedisInstance = RedisConfigService.getIoRedisInstance();
    this.getCachedResponse = createAsyncCacheDedupe(key => this.ioRedisInstance.get(key));
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

      if (!isNil(value)) {
        const reply: FastifyReply | null = context.switchToHttp().getResponse();

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

    const user: IAuth0User | undefined = request?.user;
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

  private async setCache(responseBody: any, key: string, ttl?: number): Promise<void> {
    const serializedResponseBody = this.serializeResponseBody(responseBody);

    try {
      if (typeof ttl === 'number') {
        await this.ioRedisInstance.setex(key, ttl, serializedResponseBody);

        return;
      }

      await this.ioRedisInstance.set(key, serializedResponseBody);
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
