import { RedisOptions } from 'ioredis';

export interface IRedisModuleOptions extends RedisOptions {
  url?: string;
  ttl?: number; // default seconds
}
