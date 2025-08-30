import path from 'node:path';
import * as process from 'node:process';

import { FastifyServerOptions } from 'fastify';

import { packageJsonInfo } from '@shared/constants/package-json-info';
import { RedisModuleOptions } from '@shared/modules/redis/interfaces/redis-module-options.interface';
import { checkEnvVarsSet } from '@shared/utils/check-env-vars-set';
import { generateRequestId } from '@shared/utils/generate-request-id.util';

// disable the check for unit tests
if (process.env.NODE_ENV !== 'test') {
  checkEnvVarsSet(path.resolve(__dirname, '..', '..', '.env.example'));
}
setUtcTimezone();

// TODO Add config validation
export const config = {
  app: {
    baseUrl: process.env.BASE_URL as string,
    port: process.env.PORT as string,
    version: process.env.APP_VERSION || packageJsonInfo.version,
    mode: process.env.NODE_ENV,
    isDevelopment: process.env.NODE_ENV === 'development',
    logger: {
      level: process.env.LOGGER_LEVEL,
      prettyPrint: process.env.LOG_FORMAT === 'pretty',
      requestLoggerIgnorePaths: [
        '/',
        'favicon.ico',
        '/metrics',
        '/docs',
        '/docs/favicon-32x32.png',
        '/docs/swagger-ui.css',
        '/docs/swagger-ui-init.js',
        '/docs/swagger-ui-bundle.js',
        '/docs/swagger-ui-standalone-preset.js',
      ] as string[],
    },
    fastify: {
      getConfig: async (): Promise<FastifyServerOptions> => {
        const ONE_KB = 1024;
        const { serverFactory } = await import('@geut/fastify-uws');

        return {
          genReqId: generateRequestId,
          bodyLimit: ONE_KB,
          serverFactory,
        };
      },
    },
  },
  cache: {
    redis: {
      host: process.env.REDIS_CONFIG_HOST,
      port: Number(process.env.REDIS_CONFIG_PORT),
      name: process.env.REDIS_CONFIG_NAME,
      sentinels: mapRedisSentinels(process.env.REDIS_CONFIG_SENTINELS),
      ttl: Number(process.env.REDIS_TTL), // seconds
      enableAutoPipelining: true,
    } satisfies RedisModuleOptions,
  },
  auth: {
    auth0Domain: process.env.AUTH_AUTH0_DOMAIN as string,
    auth0ClientId: process.env.AUTH_CLIENT_ID,
    auth0ClientSecret: process.env.AUTH_CLIENT_SECRET,
  },
  jobScheduler: {
    dkron: {
      url: process.env.DKRON_URL as string,
    },
  },
} as const;

function mapRedisSentinels(
  stringRedisSentinels: string | undefined,
): Array<{ host: string; port: number }> | undefined {
  if (!stringRedisSentinels) {
    return undefined;
  }

  return stringRedisSentinels.split(',').map((hostPort: string) => {
    const [sentinelHost, sentinelPort] = hostPort.split(':', 2);

    return {
      host: sentinelHost!,
      port: Number(sentinelPort!),
    };
  });
}

function setUtcTimezone(): void {
  process.env.TZ = 'UTC';
}
