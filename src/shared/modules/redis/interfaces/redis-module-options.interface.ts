import { RedisOptions } from 'ioredis';

export interface IRedisModuleOptions extends RedisOptions {
  defaultTTL?: number; // seconds
}
