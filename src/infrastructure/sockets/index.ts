import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';

export class SocketServer {
  private io: Server;

  constructor(httpServer: HttpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.APP_ORIGIN,
        methods: ['GET', 'POST'],
        credentials: true
      },
      transports: ['websocket']
    });

    // this.setupMiddleware();
    this.setupEventHandlers();
  }

  // private setupMiddleware(): void {
  //   this.io.use(authMiddleware);
  // }

  private setupEventHandlers(): void {
    this.io.on('connection', (socket: Socket) => {
      console.log(`User connected: ${socket.id}`);

      // Register event handlers

      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
      });
    });
  }

  public getIO(): Server {
    return this.io;
  }
}
