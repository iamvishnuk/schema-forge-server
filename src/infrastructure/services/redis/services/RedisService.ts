/* eslint-disable @typescript-eslint/no-explicit-any */
import Redis from 'ioredis';
import { IRedisService } from '../../../../core/interfaces/IRedisService';
import { redisConfig } from '../../../../config/redis.config';
import logger from '../../../../utils/logger';

/**
 * Redis service implementation using ioredis
 * Provides methods for interacting with Redis
 */
export class RedisService implements IRedisService {
  private client: Redis;

  constructor() {
    // Create ioredis client with configuration
    this.client = new Redis({
      host: redisConfig.host || 'localhost',
      port: redisConfig.port || 6379,
      password: redisConfig.password || undefined,
      db: redisConfig.db || 0,
      // Reconnect strategy
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      }
    });

    this.setupEventHandlers();
  }

  /**
   * Set up Redis client event handlers
   */
  private setupEventHandlers(): void {
    this.client.on('error', (err) => {
      logger.error(`Redis error: ${err.message}`);
    });

    this.client.on('connect', () => {
      logger.info('Redis connected');
    });

    this.client.on('reconnecting', () => {
      logger.info('Redis reconnecting');
    });

    this.client.on('end', () => {
      logger.info('Redis connection closed');
    });
  }

  /**
   * Set a value in Redis with an optional TTL
   * @param key The key to store the value under
   * @param value The value to store
   * @param ttl Optional time-to-live in seconds
   */
  async set(key: string, value: any, ttl?: number): Promise<void> {
    // Convert objects to JSON strings
    const valueToStore =
      typeof value === 'object' ? JSON.stringify(value) : value;

    if (ttl) {
      await this.client.setex(key, ttl, valueToStore);
    } else {
      await this.client.set(key, valueToStore);
    }
  }

  /**
   * Get a value from Redis
   * @param key The key to retrieve
   * @returns The stored value or null if not found
   */
  async get<T>(key: string): Promise<T | null> {
    const value = await this.client.get(key);

    if (!value) {
      return null;
    }

    try {
      // Try to parse as JSON
      return JSON.parse(value) as T;
    } catch {
      // If not valid JSON, return as is
      return value as unknown as T;
    }
  }

  /**
   * Delete a value from Redis
   * @param key The key to delete
   */
  async delete(key: string): Promise<void> {
    await this.client.del(key);
  }

  /**
   * Check if a key exists in Redis
   * @param key The key to check
   * @returns True if the key exists, false otherwise
   */
  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key);
    return result === 1;
  }

  /**
   * Close the Redis connection
   */
  async close(): Promise<void> {
    await this.client.quit();
  }
}
