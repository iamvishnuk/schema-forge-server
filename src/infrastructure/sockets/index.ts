import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';

export class SocketServer {
  private io: Server;
  private projectsUsersDetails: Map<
    string,
    { userName: string; socketId: string }[]
  > = new Map();

  constructor(httpServer: HttpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.APP_ORIGIN,
        methods: ['GET', 'POST'],
        credentials: true
      },
      transports: ['websocket', 'polling']
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

      // join a room with project id and emit how many user are in the room

      socket.on(
        'PROJECT:JOIN',
        ({ projectId, userName }: { projectId: string; userName: string }) => {
          console.log('projectId', projectId);
          socket.join(projectId);
          this.projectsUsersDetails.set(projectId, [
            ...(this.projectsUsersDetails.get(projectId) || []),
            { userName, socketId: socket.id }
          ]);
          const details = this.projectsUsersDetails.get(projectId);
          console.log('details', details);
          this.io.to(projectId).emit('PROJECT:USER_COUNT', details);
        }
      );

      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        this.projectsUsersDetails.forEach((users, projectId) => {
          const userIndex = users.findIndex(
            (user) => user.socketId === socket.id
          );
          if (userIndex !== -1) {
            users.splice(userIndex, 1);
            this.projectsUsersDetails.set(projectId, users);
          }
        });

        this.projectsUsersDetails.forEach((users, projectId) => {
          const details = this.projectsUsersDetails.get(projectId);
          this.io.to(projectId).emit('PROJECT:USER_COUNT', details);
        });
      });
    });
  }

  public getIO(): Server {
    return this.io;
  }
}
