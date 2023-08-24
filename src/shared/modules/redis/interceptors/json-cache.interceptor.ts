import { FastifyReply } from 'fastify';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

import { CACHE_KEY_METADATA, CACHE_TTL_METADATA } from '@nestjs/cache-manager';
import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
  Optional,
} from '@nestjs/common';
import { isFunction, isNil } from '@nestjs/common/utils/shared.utils';
import { HttpAdapterHost, Reflector } from '@nestjs/core';

import { IAuth0User } from '@shared/modules/auth/interfaces/auth0-user.interface';
import { Logger } from '@shared/modules/logger/loggers/logger';
import { IoredisWithDefaultTtl } from '@shared/modules/redis/classes/ioredis-with-default-ttl';
import { RedisConfigService } from '@shared/modules/redis/services/redis-config/redis-config.service';

@Injectable()
export class JsonCacheInterceptor implements NestInterceptor {
  private ioRedisInstance: IoredisWithDefaultTtl;
  private logger = new Logger(JsonCacheInterceptor.name);

  @Optional()
  @Inject()
  protected readonly httpAdapterHost: HttpAdapterHost;

  protected allowedMethods = ['GET'];

  constructor(protected readonly reflector: Reflector) {
    this.ioRedisInstance = RedisConfigService.getIoRedisInstance();
  }

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const key = this.getCacheKey(context);
    const ttlValueOrFactory =
      this.reflector.get(CACHE_TTL_METADATA, context.getHandler()) ?? null;

    if (!key) {
      return next.handle();
    }

    try {
      const value = await this.ioRedisInstance.get(key);

      if (!isNil(value)) {
        const reply: FastifyReply = context.switchToHttp().getResponse();

        if (reply) {
          reply.header('content-type', 'application/json; charset=utf-8');
        }

        return of(value);
      }

      const ttl = isFunction(ttlValueOrFactory)
        ? await ttlValueOrFactory(context)
        : ttlValueOrFactory;

      return next.handle().pipe(tap(async response => this.setCache(response, key, ttl)));
    } catch {
      return next.handle();
    }
  }

  private getCacheKey(context: ExecutionContext): string | undefined {
    if (!this.isRequestCacheable(context)) {
      return undefined;
    }

    const httpAdapter = this.httpAdapterHost.httpAdapter;
    const isHttpApp = httpAdapter && !!httpAdapter.getRequestMethod;
    const cacheMetadata = this.reflector.get(CACHE_KEY_METADATA, context.getHandler());

    const user: IAuth0User | undefined = context.switchToHttp().getRequest()?.user;
    const userId = user?.sub;
    const cacheKeyPrefix = userId ? `user_${userId}:` : 'publicUser:';

    if (!isHttpApp || cacheMetadata) {
      return cacheKeyPrefix + cacheMetadata;
    }

    const request = context.getArgByIndex(0);
    const reqUrl = httpAdapter.getRequestUrl(request);

    return cacheKeyPrefix + reqUrl;
  }

  protected isRequestCacheable(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    return this.allowedMethods.includes(req.method);
  }

  private async setCache(responseBody: any, key: string, ttl?: number): Promise<void> {
    const serializedResponseBody = this.serializeResponseBody(responseBody);

    try {
      if (isNil(ttl)) {
        await this.ioRedisInstance.set(key, serializedResponseBody);
        return;
      }

      await this.ioRedisInstance.set(key, serializedResponseBody, 'EX', ttl);
    } catch (err) {
      this.logger.error(
        `An error has occurred when inserting "key: ${key}", "value: ${responseBody}"`,
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
