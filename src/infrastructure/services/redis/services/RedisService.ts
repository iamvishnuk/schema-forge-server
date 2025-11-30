/* eslint-disable @typescript-eslint/no-explicit-any */
import Redis from 'ioredis';
import { IRedisService } from '../../../../core/interfaces/IRedisService';
import { redisConfig } from '../../../../config/redis.config';
import logger from '../../../../utils/logger';
import { S3Service } from '../../s3/services/S3Service';

/**
 * Redis service implementation using ioredis
 * Provides methods for interacting with Redis
 */
export class RedisService implements IRedisService {
  private client: Redis;
  private subscriber: Redis;
  private s3Service: S3Service;
  private s3UpdateQueue = new Map<string, NodeJS.Timeout>();

  constructor(s3Service: S3Service) {
    this.s3Service = s3Service;

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

    // Create a separate Redis client for subscriptions
    this.subscriber = new Redis({
      host: redisConfig.host || 'localhost',
      port: redisConfig.port || 6379,
      password: redisConfig.password || undefined,
      db: redisConfig.db || 0,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      }
    });

    this.setupEventHandlers();
    this.setupKeyspaceNotifications();
  }

  /**
   * Set up Redis client event handlers
   */
  private setupEventHandlers(): void {
    this.client.on('error', (err) => {
      // Don't log Redis errors as errors in test environment
      if (process.env.NODE_ENV === 'test') {
        logger.warn(`Redis error in test environment: ${err.message}`);
      } else {
        logger.error(`Redis error: ${err.message}`);
      }
    });

    this.client.on('connect', () => {
      logger.info('Redis connected');
    });

    this.client.on('reconnecting', () => {
      if (process.env.NODE_ENV === 'test') {
        logger.warn('Redis reconnecting in test environment');
      } else {
        logger.info('Redis reconnecting');
      }
    });

    this.client.on('end', () => {
      logger.info('Redis connection closed');
    });

    // Set up event handlers for subscriber client
    this.subscriber.on('error', (err) => {
      // Don't log Redis subscriber errors as errors in test environment
      if (process.env.NODE_ENV === 'test') {
        logger.warn(
          `Redis subscriber error in test environment: ${err.message}`
        );
      } else {
        logger.error(`Redis subscriber error: ${err.message}`);
      }
    });

    this.subscriber.on('connect', () => {
      logger.info('Redis subscriber connected');
    });
  }

  /**
   * Set up Redis Keyspace Notifications for diagram updates
   */
  private setupKeyspaceNotifications(): void {
    // Configure Redis to publish keyspace events
    this.subscriber.config('SET', 'notify-keyspace-events', 'KEA');

    // Subscribe to keyspace notifications for diagram keys
    this.subscriber.psubscribe('__keyspace@*__:project:diagram:*');

    logger.info('Redis Keyspace Notifications configured for diagram updates');

    // Handle keyspace events
    this.subscriber.on('pmessage', (pattern, channel, message) => {
      if (message === 'set' || message === 'del') {
        // Extract the project ID from the channel
        // Format: __keyspace@0__:project:diagram:projectId
        const key = channel.split('__:')[1];
        const projectId = key.split(':')[2];

        logger.info(
          `Redis event detected for diagram ${projectId}, triggering S3 update`
        );

        // Trigger S3 update for this project with debouncing
        this.debouncedS3Update(projectId);
      }
    });
  }

  /**
   * Debounced S3 update to prevent excessive writes
   * @param projectId The project ID to update in S3
   */
  private debouncedS3Update(projectId: string): void {
    // Clear any existing timeout for this project
    if (this.s3UpdateQueue.has(projectId)) {
      clearTimeout(this.s3UpdateQueue.get(projectId)!);
    }

    // Set a new timeout (5 seconds)
    this.s3UpdateQueue.set(
      projectId,
      setTimeout(async () => {
        try {
          // Get the diagram from Redis
          const redisCacheKey = `project:diagram:${projectId}`;
          const diagram =
            await this.get<Record<string, unknown>>(redisCacheKey);

          if (diagram) {
            // Update the diagram in S3
            const filePath = `design/${projectId}/${projectId}-design.json`;
            await this.s3Service.updateProjectDesign(diagram, filePath);

            logger.info(`Updated S3 diagram for project ${projectId}`);
          }

          // Remove from queue after update
          this.s3UpdateQueue.delete(projectId);
        } catch (error) {
          logger.error(`Error updating S3 for project ${projectId}: ${error}`);
          this.s3UpdateQueue.delete(projectId);
        }
      }, 5000)
    );
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
   * Rate limiter for tracking and limiting requests
   * @param key The key to track (e.g., user ID or IP address)
   * @param windowMs Time window in milliseconds
   * @param maxAttempts Maximum number of attempts allowed in the window
   * @returns Object with success status and remaining attempts
   */
  async rateLimiter(
    key: string,
    windowMs: number,
    maxAttempts: number
  ): Promise<{ success: boolean; remaining: number; resetTime: number }> {
    const rateLimitKey = `rate_limit:${key}`;
    const now = Date.now();
    const windowStart = now - windowMs;

    try {
      // Use a Lua script to atomically check and update the rate limit
      // This ensures race condition safety
      const luaScript = `
        local key = KEYS[1]
        local window_start = tonumber(ARGV[1])
        local now = tonumber(ARGV[2])
        local max_attempts = tonumber(ARGV[3])
        local window_ms = tonumber(ARGV[4])

        -- Remove old entries outside the window
        redis.call('ZREMRANGEBYSCORE', key, '-inf', window_start)

        -- Get current count
        local current_count = redis.call('ZCARD', key)

        -- Calculate reset time (end of current window)
        local reset_time = now + window_ms

        if current_count < max_attempts then
          -- Add current request
          redis.call('ZADD', key, now, now)
          -- Set expiration for the key
          redis.call('EXPIRE', key, math.ceil(window_ms / 1000))
          return {1, max_attempts - current_count - 1, reset_time}
        else
          return {0, 0, reset_time}
        end
      `;

      const result = (await this.client.eval(
        luaScript,
        1,
        rateLimitKey,
        windowStart.toString(),
        now.toString(),
        maxAttempts.toString(),
        windowMs.toString()
      )) as number[];

      const success = result[0] === 1;
      const remaining = result[1];
      const resetTime = result[2];

      logger.debug(
        `Rate limiter - Key: ${key}, Success: ${success}, Remaining: ${remaining}, Reset: ${new Date(resetTime).toISOString()}`
      );

      return {
        success,
        remaining,
        resetTime
      };
    } catch (error) {
      logger.error(`Rate limiter error for key ${key}: ${error}`);
      // On error, allow the request (fail open)
      return {
        success: true,
        remaining: maxAttempts - 1,
        resetTime: now + windowMs
      };
    }
  }

  /**
   * Close the Redis connection
   */
  async close(): Promise<void> {
    // Clean up any pending S3 update timers
    for (const [projectId, timeout] of this.s3UpdateQueue.entries()) {
      clearTimeout(timeout);
      logger.info(`Cleared pending S3 update for project ${projectId}`);
    }

    // Unsubscribe from keyspace notifications
    await this.subscriber.punsubscribe();
    await this.subscriber.quit();

    // Close main Redis client
    await this.client.quit();

    logger.info('Redis connections closed');
  }
}
