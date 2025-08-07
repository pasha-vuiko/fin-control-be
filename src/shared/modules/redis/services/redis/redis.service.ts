import Redis from 'ioredis';

import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';

import { CatchErrors } from '@shared/modules/error/decorators/catch-errors/catch-errors.decorator';
import { internalErrHandler } from '@shared/modules/error/handlers/internal-err-handler';
import { DEFAULT_CACHE_TTL } from '@shared/modules/redis/constants/defaults';
import { IRedisModuleOptions } from '@shared/modules/redis/interfaces/redis-module-options.interface';
import { REDIS_MODULE_OPTIONS } from '@shared/modules/redis/providers/redis-module-options.provider';
import { RedisConfigService } from '@shared/modules/redis/services/redis-config/redis-config.service';

@Injectable()
export class RedisService {
  private ioRedisInstance: Redis;

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @Inject(REDIS_MODULE_OPTIONS) private moduleOptions: IRedisModuleOptions,
  ) {
    this.ioRedisInstance = RedisConfigService.getIoRedisInstance();
  }

  /***
   *
   * @description checks if result of wrapped function exists in cache,
   * @description if exists value from cache returned,
   * @description if not exist function is being executed
   */
  @CatchErrors(internalErrHandler)
  public async wrap<T>(
    cacheKey: string,
    cb: (...args: any[]) => Promise<T>,
    ttl = this.moduleOptions.ttl ?? DEFAULT_CACHE_TTL,
  ): Promise<T> {
    return await this.cacheManager.wrap<T>(cacheKey, cb, ttl);
  }

  @CatchErrors(internalErrHandler)
  public async set<T>(
    cacheKey: string,
    value: T,
    ttl = this.moduleOptions.ttl ?? DEFAULT_CACHE_TTL,
  ): Promise<T> {
    // @ts-expect-error incorrect typing for .set()
    await this.cacheManager.set(cacheKey, value, { ttl });

    return value;
  }

  @CatchErrors(internalErrHandler)
  public async update<T>(key: string, value: T): Promise<T> {
    const isCachable = !(
      typeof value === 'function' ||
      value === undefined ||
      value === null
    );

    if (!isCachable) {
      throw new Error('The input value is not cachable');
    }

    if (typeof value === 'object' || typeof value === 'boolean') {
      await this.ioRedisInstance.set(key, JSON.stringify(value), 'KEEPTTL');
    } else {
      await this.ioRedisInstance.set(key, value as any, 'KEEPTTL');
    }

    return value;
  }

  @CatchErrors(internalErrHandler)
  public async setRaw(
    cacheKey: string,
    value: string,
    ttl = this.moduleOptions.ttl ?? DEFAULT_CACHE_TTL,
  ): Promise<string> {
    await this.ioRedisInstance.setex(cacheKey, ttl, value);

    return value;
  }

  @CatchErrors(internalErrHandler)
  public async get<T>(cacheKey: string): Promise<T | null> {
    return (await this.cacheManager.get<T>(cacheKey)) ?? null;
  }

  @CatchErrors(internalErrHandler)
  public async getRaw(cacheKey: string): Promise<string | null> {
    return await this.ioRedisInstance.get(cacheKey);
  }

  @CatchErrors(internalErrHandler)
  public async ttl(cacheKey: string): Promise<number> {
    return await this.ioRedisInstance.ttl(cacheKey);
  }

  @CatchErrors(internalErrHandler)
  public async checkIfExists(cacheKey: string): Promise<boolean> {
    const result = await this.ioRedisInstance.exists(cacheKey);

    return Boolean(result);
  }

  @CatchErrors(internalErrHandler)
  public async delete(cacheKey: string): Promise<boolean> {
    const result = await this.ioRedisInstance.del(cacheKey);

    return Boolean(result);
  }
}
