import { Socket } from 'socket.io';

/**
 * Interface for socket middleware
 * Follows the clean architecture principle by defining a contract
 * that concrete implementations must follow
 */
export interface ISocketMiddleware {
  /**
   * Apply middleware to a socket connection
   * @param socket The socket to apply middleware to
   * @param next Function to call when middleware is complete
   */
  apply(socket: Socket, next: (err?: Error) => void): void;
}
