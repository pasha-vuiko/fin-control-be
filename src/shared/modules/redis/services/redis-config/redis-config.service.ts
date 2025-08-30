import ValKey from '@keyv/valkey';
import Redis from 'ioredis';
import Keyv from 'keyv';

import { CacheModuleOptions, CacheOptionsFactory } from '@nestjs/cache-manager';
import { Inject, Injectable, OnApplicationShutdown } from '@nestjs/common';

import { Logger } from '@shared/modules/logger/loggers/logger';
import { RedisModuleOptions } from '@shared/modules/redis/interfaces/redis-module-options.interface';
import { REDIS_MODULE_OPTIONS } from '@shared/modules/redis/providers/redis-module-options.provider';
import { omitObjKeys } from '@shared/utils/omit-obj-keys.util';

@Injectable()
export class RedisConfigService implements CacheOptionsFactory, OnApplicationShutdown {
  private static moduleOptions: RedisModuleOptions;
  private static ioRedisInstance: Redis;
  private static readonly logger = new Logger('RedisConfigService');

  constructor(
    @Inject(REDIS_MODULE_OPTIONS) private readonly moduleOptions: RedisModuleOptions,
  ) {
    RedisConfigService.moduleOptions = moduleOptions;
  }

  onApplicationShutdown(): void {
    RedisConfigService.getIoRedisInstance().disconnect();
    RedisConfigService.logger.log('Successfully disconnected from the Redis');
  }

  public createCacheOptions(): CacheModuleOptions {
    const valKey = new ValKey(RedisConfigService.getIoRedisInstance() as any);
    const keyv = new Keyv({
      store: valKey,
      ttl: this.moduleOptions.ttl,
    });

    return {
      stores: [keyv],
    };
  }

  public static getIoRedisInstance(): Redis {
    if (this.ioRedisInstance) {
      return this.ioRedisInstance;
    }

    if (this.moduleOptions.url) {
      this.ioRedisInstance = new Redis(
        this.moduleOptions.url,
        omitObjKeys(this.moduleOptions, 'url'),
      );
    } else {
      this.ioRedisInstance = new Redis(this.moduleOptions);
    }

    this.listenToRedisConnection(this.ioRedisInstance);
    this.listenToRedisError(this.ioRedisInstance);

    return this.ioRedisInstance;
  }

  private static listenToRedisError(redisClient: Redis): void {
    redisClient.on('error', err => {
      this.logger.error(`Redis error: ${err.message}`);
    });
  }

  private static listenToRedisConnection(redisClient: Redis): void {
    redisClient.on('connect', () => {
      this.logger.log(`Successfully connected to the Redis`);
    });
  }
}
