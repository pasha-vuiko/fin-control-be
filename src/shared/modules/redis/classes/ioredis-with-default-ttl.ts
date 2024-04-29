import IoRedis, { Callback, RedisKey, RedisOptions } from 'ioredis';

export class IoredisWithDefaultTtl extends IoRedis {
  private readonly defaultTTL: number | undefined;

  constructor(config: RedisOptions & { defaultTTL?: number }) {
    super(config);
    this.defaultTTL = config?.defaultTTL;
  }

  //@ts-expect-error types are incompatible
  override set(
    key: RedisKey,
    value: string | number | Buffer,
    expiryMode?: 'EX',
    seconds?: string | number,
    callback?: Callback<string>,
  ): Promise<'OK'> {
    if (expiryMode && seconds && callback) {
      return super.set(key, value, expiryMode, seconds, callback);
    }

    if (expiryMode && seconds) {
      return super.set(key, value, expiryMode, seconds);
    }

    if (this.defaultTTL) {
      const SECONDS_TOKEN = 'EX';

      if (callback) {
        return super.set(key, value, SECONDS_TOKEN, this.defaultTTL, callback);
      }

      return super.set(key, value, SECONDS_TOKEN, this.defaultTTL);
    }

    return super.set(key, value);
  }
}
