import { generateRequestId } from '@shared/utils/generate-request-id.util';
import { IRedisModuleOptions } from '@shared/modules/redis/interfaces/redis-module-options.interface';

const appMode = process.env.NODE_ENV || 'production';

export const config = {
  app: {
    port: process.env.PORT || 3000,
    mode: appMode,
    isDevelopment: appMode === 'development',
    logger: {
      level: process.env.LOGGER_LEVEL || 'info',
    },
    fastify: {
      genReqId: generateRequestId,
    },
  },
  cache: {
    redis: {
      host: process.env.REDIS_CONFIG_HOST,
      port: Number(process.env.REDIS_CONFIG_PORT),
      name: process.env.REDIS_CONFIG_NAME,
      sentinels: mapRedisSentinels(process.env.REDIS_CONFIG_SENTINELS),
      defaultTTL: Number(process.env.REDIS_TTL), // seconds
      enableAutoPipelining: true,
    } satisfies IRedisModuleOptions,
  },
  auth: {
    auth0Domain: process.env.AUTH_AUTH0_DOMAIN,
    auth0ClientId: process.env.AUTH_CLIENT_ID,
    auth0ClientSecret: process.env.AUTH_CLIENT_SECRET,
  },
};

function mapRedisSentinels(
  stringRedisSentinels: string | undefined,
): Array<{ host: string; port: number }> | undefined {
  if (!stringRedisSentinels) {
    return undefined;
  }

  return stringRedisSentinels.split(',').map((hostPort: string) => {
    const [sentinelHost, sentinelPort] = hostPort.split(':');

    return {
      host: sentinelHost,
      port: Number(sentinelPort),
    };
  });
}
