/* eslint-disable @typescript-eslint/no-explicit-any */
import { Socket } from 'socket.io';
import { ISocketMiddleware } from '../../../core/interfaces/ISocketMiddleware';
import { verifyJwtToken, AccessTokenPayload } from '../../../utils/jwt';
import { UserModel } from '../../../infrastructure/models/user.model';
import { SessionModel } from '../../../infrastructure/models/session.model';
import logger from '../../../utils/logger';

/**
 * Socket authentication middleware
 * Verifies the JWT token from the socket handshake and authenticates the user
 */
export class SocketAuthMiddleware implements ISocketMiddleware {
  constructor() {}

  /**
   * Apply authentication middleware to a socket connection
   * @param socket The socket to authenticate
   * @param next Function to call when middleware is complete
   */
  async apply(socket: Socket, next: (err?: Error) => void): Promise<void> {
    try {
      // Get token from handshake auth or cookies
      const token = this.extractToken(socket);

      if (!token) {
        return next(new Error('Authentication error: Missing token'));
      }

      // Verify the token
      const { payload, error } = verifyJwtToken<AccessTokenPayload>(token);

      if (error || !payload) {
        logger.error(`Socket auth error: ${error}`);
        return next(new Error('Authentication error: Invalid token'));
      }

      // Find user and session
      const [user, session] = await Promise.all([
        UserModel.findById(payload.userId),
        SessionModel.findById(payload.sessionId)
      ]);

      if (!user || !session) {
        return next(
          new Error('Authentication error: User or session not found')
        );
      }

      // Check if session is active
      if (session.expiredAt < new Date()) {
        return next(new Error('Authentication error: Session expired'));
      }

      // Attach user and session to socket for later use
      (socket as any).user = user;
      (socket as any).session = session;
      (socket as any).userId = user._id;

      logger.info(`Socket authenticated: ${user.email} (${socket.id})`);
      next();
    } catch (error: any) {
      logger.error(`Socket auth error: ${error.message}`);
      next(new Error('Authentication error'));
    }
  }

  /**
   * Extract token from socket handshake
   * @param socket The socket connection
   * @returns The extracted token or null if not found
   */
  private extractToken(socket: Socket): string | null {
    // Try to get token from cookies first (primary method)
    const cookies = this.parseCookies(socket.handshake.headers.cookie);
    if (cookies.accessToken) {
      return cookies.accessToken;
    }

    // Fallback: Try to get token from handshake auth
    const authHeader = socket.handshake.auth?.token;
    if (authHeader) {
      return authHeader;
    }

    // Fallback: Try to get token from handshake headers (for compatibility with HTTP)
    const headerAuth = socket.handshake.headers.authorization;
    if (headerAuth && headerAuth.startsWith('Bearer ')) {
      return headerAuth.substring(7);
    }

    return null;
  }

  /**
   * Parse cookie string into an object
   * @param cookieString The cookie string from request headers
   * @returns Object with cookie name-value pairs
   */
  private parseCookies(cookieString?: string): Record<string, string> {
    const cookies: Record<string, string> = {};

    if (!cookieString) {
      return cookies;
    }

    const cookiePairs = cookieString.split(';');

    for (const cookie of cookiePairs) {
      const [name, value] = cookie.trim().split('=');
      if (name && value) {
        cookies[name] = decodeURIComponent(value);
      }
    }

    return cookies;
  }
}
