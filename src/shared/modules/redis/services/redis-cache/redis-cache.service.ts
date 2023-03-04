import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { Command } from 'ioredis';

import { DEFAULT_CACHE_TTL } from '@shared/modules/redis/constants/defaults';
import { RedisConfigService } from '@shared/modules/redis/services/redis-config/redis-config.service';
import { CacheIndexesEnum } from '@shared/modules/redis/enums/cache-indexes.enum';
import { internalErrHandler } from '@shared/modules/error/handlers/internal-err-handler';
import { ICreateIndexOptions } from '@shared/modules/redis/interfaces/create-index-options.interface';
import { ArrayType } from '@shared/types/array.type';
import { ISearchResults } from '@shared/modules/redis/interfaces/search-results.interface';
import { ICreateSearchIndexSchema } from '@shared/modules/redis/interfaces/create-search-index-schema.interface';
import { transformCreateSearchIndexArgs } from '@shared/modules/redis/utils/transform-create-search-index-args.util';
import { Catch } from '@shared/modules/error/decorators/catch.decorator';
import { IoredisWithDefaultTtl } from '@shared/modules/redis/classes/ioredis-with-default-ttl';

@Injectable()
export class RedisCacheService {
  private ioRedisInstance: IoredisWithDefaultTtl;

  constructor(
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {
    this.ioRedisInstance = RedisConfigService.getIoRedisInstance();
  }

  /***
   *
   * @description checks if result of wrapped function exists in cache,
   * @description if exists value from cache returned,
   * @description if not exist function is being executed
   */
  @Catch(internalErrHandler)
  public async wrap<T>(
    cacheKey: string,
    cb: (...args: any[]) => Promise<T>,
    ttl = DEFAULT_CACHE_TTL,
  ): Promise<T> {
    return this.cacheManager.wrap<T>(cacheKey, cb, ttl);
  }

  @Catch(internalErrHandler)
  public async set<T>(cacheKey: string, value: T, ttl = DEFAULT_CACHE_TTL): Promise<T> {
    await this.cacheManager.set(cacheKey, value, ttl);

    return value;
  }

  @Catch(internalErrHandler)
  public async setRaw(
    cacheKey: string,
    value: string,
    ttl = DEFAULT_CACHE_TTL,
  ): Promise<string> {
    await this.ioRedisInstance.set(cacheKey, value, 'EX', ttl);

    return value;
  }

  @Catch(internalErrHandler)
  public async jSet<T extends Record<string, any>>(
    cacheKey: string,
    value: T,
    ttl = DEFAULT_CACHE_TTL,
  ): Promise<T> {
    const stringifiedValue = JSON.stringify(value);

    await this.sendCommand('JSON.SET', cacheKey, '$', stringifiedValue);
    await this.ioRedisInstance.expire(cacheKey, ttl);

    return value;
  }

  @Catch(internalErrHandler)
  public async jGet<T extends Record<string, any>>(cacheKey: string): Promise<T | null> {
    const stringifiedResult = await this.sendCommand('JSON.GET', cacheKey);

    return JSON.parse(stringifiedResult);
  }

  @Catch(internalErrHandler)
  public async get<T>(cacheKey: string): Promise<T | undefined> {
    return this.cacheManager.get<T>(cacheKey);
  }

  @Catch(internalErrHandler)
  public async getRaw(cacheKey: string): Promise<string | null> {
    return this.ioRedisInstance.get(cacheKey);
  }

  @Catch(internalErrHandler)
  public async searchByNumericRange<T extends ArrayType>(
    index: CacheIndexesEnum,
    searchKeyName: string,
    limit: { from: number; to: number },
  ): Promise<T> {
    const { values } = await this.search<T>(
      index,
      `@${searchKeyName}:[${limit.from} ${limit.to}]`,
    );

    return values;
  }

  @Catch(internalErrHandler)
  public async searchByNumeric<T extends ArrayType>(
    index: CacheIndexesEnum,
    searchKeyName: string,
    searchValue: number,
  ): Promise<T> {
    const { values } = await this.search<T>(
      index,
      `@${searchKeyName}:[${searchValue} ${searchValue}]`,
    );

    return values;
  }

  @Catch(internalErrHandler)
  public async searchByTag<T extends ArrayType>(
    index: CacheIndexesEnum,
    searchKeyName: string,
    searchTag: string,
  ): Promise<T> {
    const { values } = await this.search<T>(index, `@${searchKeyName}:{${searchTag}}`);

    return values;
  }

  @Catch(internalErrHandler)
  public async search<T extends ArrayType>(
    index: CacheIndexesEnum,
    query: string,
    maxSearchLimit = 100_000,
  ): Promise<ISearchResults<T>> {
    const rawSearchResults = await this.sendCommand(
      'ft.search',
      index,
      query,
      'LIMIT',
      0,
      maxSearchLimit,
    );

    return RedisCacheService.parseSearchResult(rawSearchResults);
  }

  @Catch(internalErrHandler)
  public async ttl(cacheKey: string): Promise<number> {
    return this.ioRedisInstance.ttl(cacheKey);
  }

  public async createIndex(
    index: CacheIndexesEnum,
    schema: ICreateSearchIndexSchema,
    options?: ICreateIndexOptions,
  ): Promise<'OK'> {
    const redisCommandArr = transformCreateSearchIndexArgs(index, schema, options);
    const [redisCommand, ...commandOpts] = redisCommandArr;

    return this.sendCommand(redisCommand, ...commandOpts);
  }

  private static parseSearchResult<T extends ArrayType>(
    rawSearchResult: any[],
  ): ISearchResults<T> {
    const [total, ...rawResults] = rawSearchResult;

    const parsedResults: any[] = [];

    for (let i = 1; i < rawResults.length; i += 2) {
      const stringifiedValue = rawResults[i][1];
      const jsonValue = JSON.parse(stringifiedValue);

      parsedResults.push(jsonValue);
    }

    return {
      total,
      values: parsedResults as T,
    };
  }

  private async sendCommand(...commandArgs: (string | number)[]): Promise<string | any> {
    const [name, ...args] = commandArgs;
    const command = new Command(name as string, args);
    this.ioRedisInstance.sendCommand(command);

    return command.promise;
  }
}
