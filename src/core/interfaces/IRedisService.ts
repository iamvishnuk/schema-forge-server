/**
 * Interface for Redis service operations
 * Follows the clean architecture principle by defining a contract
 * that concrete implementations must follow
 */
export interface IRedisService {
  /**
   * Set a value in Redis with an optional TTL
   * @param key The key to store the value under
   * @param value The value to store
   * @param ttl Optional time-to-live in seconds
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  set(key: string, value: any, ttl?: number): Promise<void>;

  /**
   * Get a value from Redis
   * @param key The key to retrieve
   * @returns The stored value or null if not found
   */
  get<T>(key: string): Promise<T | null>;

  /**
   * Delete a value from Redis
   * @param key The key to delete
   */
  delete(key: string): Promise<void>;

  /**
   * Check if a key exists in Redis
   * @param key The key to check
   * @returns True if the key exists, false otherwise
   */
  exists(key: string): Promise<boolean>;
}
