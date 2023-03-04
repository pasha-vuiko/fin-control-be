import { Provider } from '@nestjs/common';
import redisStore from 'cache-manager-ioredis';

export const REDIS_STORE = 'REDIS_STORE';

export const redisStoreProvider: Provider<typeof redisStore> = {
  provide: REDIS_STORE,
  useValue: redisStore,
};
