import { RedisOptions } from 'ioredis';

export interface RedisModuleOptions extends RedisOptions {
  url?: string;
  ttl?: number; // default seconds
}
