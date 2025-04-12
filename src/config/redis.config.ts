import { config } from './env';

export const redisConfig = {
  host: config.REDIS_HOST,
  port: Number(config.REDIS_PORT),
  password: config.REDIS_PASSWORD,
  db: config.REDIS_DB,
  ttl: config.REDIS_TTL
};
