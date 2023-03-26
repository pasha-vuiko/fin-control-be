import IoRedis, { Callback, RedisKey, RedisOptions } from 'ioredis';

export class IoredisWithDefaultTtl extends IoRedis {
  private readonly defaultTTL: number | undefined;

  constructor(config: RedisOptions & { defaultTTL?: number }) {
    super(config);
    this.defaultTTL = config?.defaultTTL;
  }

  //@ts-expect-error types are incompatible
  set(
    key: RedisKey,
    value: string | number | Buffer,
    secondsToken?: 'EX',
    seconds?: string | number,
    callback?: Callback<'OK'>,
  ): Promise<'OK'> {
    if (secondsToken && seconds && callback) {
      return super.set(key, value, secondsToken, seconds, callback);
    }

    if (secondsToken && seconds) {
      return super.set(key, value, secondsToken, seconds);
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
