import Redis from 'ioredis';
import { env } from '@config/env';
import { logger } from '@logging/logger';

let redisClient: Redis | null = null;

export function getRedisClient(): Redis | null {
  if (redisClient) return redisClient;

  try {
    redisClient = new Redis({
      host: env.REDIS_HOST,
      port: parseInt(env.REDIS_PORT, 10),
      password: env.REDIS_PASSWORD || undefined,
      lazyConnect: true,
      maxRetriesPerRequest: 1,
    });

    redisClient.on('connect', () => logger.info('Connected to Redis'));
    redisClient.on('error', (err) => logger.warn({ err }, 'Redis connection error (fallback mode enabled)'));

    return redisClient;
  } catch (err) {
    logger.warn({ err }, 'Failed to initialize Redis client');
    return null;
  }
}
