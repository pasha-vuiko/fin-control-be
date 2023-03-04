import { generateRequestId } from '@shared/utils/generate-request-id.util';

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
      port: process.env.REDIS_CONFIG_PORT,
      name: process.env.REDIS_CONFIG_NAME,
      sentinels: process.env.REDIS_CONFIG_SENTINELS, //redis-sentinel-0:26379,redis-sentinel-1:26379,redis-sentinel-2:26379
      defaultTTL: process.env.REDIS_TTL, // seconds
    },
  },
  auth: {
    auth0Domain: process.env.AUTH_AUTH0_DOMAIN,
    auth0ClientId: process.env.AUTH_CLIENT_ID,
    auth0ClientSecret: process.env.AUTH_CLIENT_SECRET,
  },
};
