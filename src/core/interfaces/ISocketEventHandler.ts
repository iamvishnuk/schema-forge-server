import { Socket } from 'socket.io';

/**
 * Interface for socket event handlers
 * Follows the clean architecture principle by defining a contract
 * that concrete implementations must follow
 */
export interface ISocketEventHandler {
  /**
   * Register event listeners for a socket
   * @param socket The socket to register events for
   */
  register(socket: Socket): void;

  /**
   * Handle socket disconnection
   * @param socket The socket that disconnected
   */
  handleDisconnect(socket: Socket): void;
}
