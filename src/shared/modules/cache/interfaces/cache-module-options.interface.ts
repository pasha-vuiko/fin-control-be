import { RedisOptions } from 'iovalkey';

export interface ICacheModuleOptions extends RedisOptions {
  valkeyUrl?: string;
  ttl?: number; // default seconds
}
