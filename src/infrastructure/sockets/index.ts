import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { ISocketEventHandler } from '../../core/interfaces/ISocketEventHandler';
import { ProjectSocketEventHandler } from './ProjectSocketEventHandler';
import { ISocketMiddleware } from '../../core/interfaces/ISocketMiddleware';
import { SocketAuthMiddleware } from './middlewares/AuthMiddleware';
import { IRedisService } from '../../core/interfaces/IRedisService';
import { RedisService } from '../services/redis/services/RedisService';
import { S3Service } from '../services/s3/services/S3Service';
import logger from '../../utils/logger';

export interface ISocketServer {
  getIO(): Server;
}

export class SocketServer implements ISocketServer {
  private io: Server;
  private eventHandlers: ISocketEventHandler[];
  private middlewares: ISocketMiddleware[];
  private redisService: IRedisService;
  private s3Service: S3Service;

  constructor(
    httpServer: HttpServer,
    eventHandlers?: ISocketEventHandler[],
    middlewares?: ISocketMiddleware[],
    redisService?: IRedisService,
    s3Service?: S3Service
  ) {
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.APP_ORIGIN,
        methods: ['GET', 'POST'],
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    this.redisService = redisService || new RedisService();
    this.s3Service = s3Service || new S3Service();

    // If no middlewares are provided, use the default SocketAuthMiddleware
    this.middlewares = middlewares || [new SocketAuthMiddleware()];

    // If no event handlers are provided, use the default ProjectSocketEventHandler
    this.eventHandlers = eventHandlers || [
      new ProjectSocketEventHandler(this.io, this.redisService, this.s3Service)
    ];

    this.setupMiddlewares();
    this.setupEventHandlers();
  }

  /**
   * Set up socket middlewares
   */
  private setupMiddlewares(): void {
    this.io.use((socket: Socket, next: (err?: Error) => void) => {
      // Apply each middleware in sequence
      const applyMiddleware = async (index: number) => {
        if (index >= this.middlewares.length) {
          // All middlewares passed, proceed to connection
          return next();
        }

        try {
          // Apply the current middleware
          await this.middlewares[index].apply(socket, (err?: Error) => {
            if (err) {
              // If middleware fails, reject the connection
              return next(err);
            }

            // Continue to the next middleware
            applyMiddleware(index + 1);
          });
        } catch (error) {
          logger.error(`Middleware error: ${error}`);
          next(new Error('Internal server error'));
        }
      };

      // Start applying middlewares from the first one
      applyMiddleware(0);
    });
  }

  private setupEventHandlers(): void {
    this.io.on('connection', (socket: Socket) => {
      logger.info(`User connected: ${socket.id}`);

      // Register all event handlers for this socket
      this.eventHandlers.forEach((handler) => {
        handler.register(socket);
      });

      socket.on('disconnect', () => {
        logger.info(`User disconnected: ${socket.id}`);

        // Notify all handlers about the disconnection
        this.eventHandlers.forEach((handler) => {
          handler.handleDisconnect(socket);
        });
      });
    });
  }

  public getIO(): Server {
    return this.io;
  }
}
