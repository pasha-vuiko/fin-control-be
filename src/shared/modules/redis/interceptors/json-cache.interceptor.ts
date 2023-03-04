import { Observable, of } from 'rxjs';
import { FastifyReply } from 'fastify';
import { tap } from 'rxjs/operators';
import {
  CACHE_KEY_METADATA,
  CACHE_TTL_METADATA,
  CallHandler,
  ExecutionContext,
  HttpServer,
  Inject,
  Injectable,
  Logger,
  NestInterceptor,
  Optional,
} from '@nestjs/common';
import { isFunction, isNil } from '@nestjs/common/utils/shared.utils';
import { RedisConfigService } from '@shared/modules/redis/services/redis-config/redis-config.service';
import { IoredisWithDefaultTtl } from '@shared/modules/redis/classes/ioredis-with-default-ttl';

const HTTP_ADAPTER_HOST = 'HttpAdapterHost';
const REFLECTOR = 'Reflector';

export interface HttpAdapterHost<T extends HttpServer = any> {
  httpAdapter: T;
}

@Injectable()
export class JsonCacheInterceptor implements NestInterceptor {
  private ioRedisInstance: IoredisWithDefaultTtl;

  @Optional()
  @Inject(HTTP_ADAPTER_HOST)
  protected readonly httpAdapterHost: HttpAdapterHost;

  protected allowedMethods = ['GET'];
  constructor(@Inject(REFLECTOR) protected readonly reflector: any) {
    this.ioRedisInstance = RedisConfigService.getIoRedisInstance();
  }

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const key = this.trackBy(context);
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

      return next.handle().pipe(
        tap(async response => {
          const serializedResponse = this.serializeResponse(response);

          try {
            if (isNil(ttl)) {
              return await this.ioRedisInstance.set(key, serializedResponse);
            }

            await this.ioRedisInstance.set(key, serializedResponse, 'EX', ttl);
          } catch (err) {
            Logger.error(
              `An error has occured when inserting "key: ${key}", "value: ${response}"`,
              'CacheInterceptor',
            );
          }
        }),
      );
    } catch {
      return next.handle();
    }
  }

  protected trackBy(context: ExecutionContext): string | undefined {
    const httpAdapter = this.httpAdapterHost.httpAdapter;
    const isHttpApp = httpAdapter && !!httpAdapter.getRequestMethod;
    const cacheMetadata = this.reflector.get(CACHE_KEY_METADATA, context.getHandler());

    if (!isHttpApp || cacheMetadata) {
      return cacheMetadata;
    }

    const request = context.getArgByIndex(0);
    if (!this.isRequestCacheable(context)) {
      return undefined;
    }
    return httpAdapter.getRequestUrl(request);
  }

  protected isRequestCacheable(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    return this.allowedMethods.includes(req.method);
  }

  private serializeResponse(response: any): string | number {
    try {
      if (typeof response === 'string' || typeof response === 'number') {
        return response;
      }

      return JSON.stringify(response);
    } catch {
      throw new Error('Failed to stringify response');
    }
  }
}
