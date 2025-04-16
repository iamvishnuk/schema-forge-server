import { Server, Socket } from 'socket.io';
import { ISocketEventHandler } from '../../core/interfaces/ISocketEventHandler';
import { IRedisService } from '../../core/interfaces/IRedisService';
import { S3Service } from '../services/s3/services/S3Service';
import { INode } from '../../definitions/interface';
import logger from '../../utils/logger';
import { TField } from '../../definitions/type';

/**
 * Handles project-related socket events
 * Implements the ISocketEventHandler interface
 */
export class ProjectSocketEventHandler implements ISocketEventHandler {
  private io: Server;
  private redisService: IRedisService;
  private s3Service: S3Service;
  private projectsUsersDetails: Map<
    string,
    { userName: string; socketId: string }[]
  > = new Map();

  constructor(io: Server, redisService: IRedisService, s3Service: S3Service) {
    this.io = io;
    this.redisService = redisService;
    this.s3Service = s3Service;
  }

  /**
   * Register event listeners for a socket
   * @param socket The socket to register events for
   */
  register(socket: Socket): void {
    // Handle project join event
    socket.on(
      'PROJECT:JOIN',
      async ({
        projectId,
        userName
      }: {
        projectId: string;
        userName: string;
      }) => {
        await this.handleProjectJoin(socket, projectId, userName);
      }
    );

    // Handle diagram update events
    socket.on(
      'DIAGRAM:UPDATE',
      async ({
        projectId,
        diagram
      }: {
        projectId: string;
        diagram: Record<string, unknown>;
      }) => {
        await this.handleDiagramUpdate(socket, projectId, diagram);
      }
    );

    // Handle node added event
    socket.on(
      'DIAGRAM:NODE_ADDED',
      async ({ projectId, node }: { projectId: string; node: INode }) => {
        await this.handleNodeAdded(socket, projectId, node);
      }
    );

    // Handle node deleted event
    socket.on(
      'DIAGRAM:NODE_DELETED',
      async ({ projectId, nodeId }: { projectId: string; nodeId: string }) => {
        await this.handleDeleteNode(socket, projectId, nodeId);
      }
    );

    // Handle node label change
    socket.on(
      'DIAGRAM:NODE_LABEL_CHANGED',
      async ({
        projectId,
        nodeId,
        label
      }: {
        projectId: string;
        nodeId: string;
        label: string;
      }) => {
        await this.handleNodeLabelChange(socket, projectId, nodeId, label);
      }
    );

    // Handle node description change
    socket.on(
      'DIAGRAM:NODE_DESCRIPTION_CHANGED',
      async ({
        projectId,
        nodeId,
        description
      }: {
        projectId: string;
        nodeId: string;
        description: string;
      }) => {
        await this.handleNodeDescriptionChange(
          socket,
          projectId,
          nodeId,
          description
        );
      }
    );

    // Handle node fields change
    socket.on(
      'DIAGRAM:ADD_NODE_FIELDS',
      async ({
        projectId,
        nodeId,
        fields
      }: {
        projectId: string;
        nodeId: string;
        fields: TField[];
      }) => {
        await this.handleAddFieldsToNode(socket, projectId, nodeId, fields);
      }
    );

    // Handle node field delete
    socket.on(
      'DIAGRAM:DELETE_NODE_FIELD',
      async ({
        projectId,
        nodeId,
        fieldId
      }: {
        projectId: string;
        nodeId: string;
        fieldId: string;
      }) => {
        await this.handleFieldDeleteFromNode(
          socket,
          projectId,
          nodeId,
          fieldId
        );
      }
    );
  }

  /**
   * Handle socket disconnection
   * @param socket The socket that disconnected
   */
  handleDisconnect(socket: Socket): void {
    // Remove user from all projects they were in
    this.projectsUsersDetails.forEach((users, projectId) => {
      const userIndex = users.findIndex((user) => user.socketId === socket.id);
      if (userIndex !== -1) {
        users.splice(userIndex, 1);
        this.projectsUsersDetails.set(projectId, users);
      }
    });

    // Update user count for all affected projects
    this.projectsUsersDetails.forEach((users, projectId) => {
      const details = this.projectsUsersDetails.get(projectId);
      this.io.to(projectId).emit('PROJECT:USER_COUNT', details);
    });
  }

  /**
   * Handle project join event
   * @param socket The socket that joined
   * @param projectId The project ID to join
   * @param userName The name of the user joining
   */
  private async handleProjectJoin(
    socket: Socket,
    projectId: string,
    userName: string
  ): Promise<void> {
    try {
      logger.info(`User ${userName} joined project ${projectId}`);

      // Join the room for this project
      socket.join(projectId);

      // Add user to project users list
      this.projectsUsersDetails.set(projectId, [
        ...(this.projectsUsersDetails.get(projectId) || []),
        { userName, socketId: socket.id }
      ]);

      // Get updated user list
      const details = this.projectsUsersDetails.get(projectId);

      // Emit updated user count to all users in the project
      this.io.to(projectId).emit('PROJECT:USER_COUNT', details);

      // Check if diagram is already in Redis
      const redisCacheKey = `project:diagram:${projectId}`;
      let diagram = await this.redisService.get(redisCacheKey);

      if (!diagram) {
        // If not in Redis, fetch from S3
        logger.info(`Fetching diagram for project ${projectId} from S3`);

        // Get the project design file path from the database
        // For now, we'll assume the file path is the project ID
        const filePath = `design/${projectId}/${projectId}-design.json`;

        try {
          // Fetch the diagram from S3
          diagram = await this.s3Service.getProjectDesign(filePath);

          // Store in Redis for future access with a TTL of 1 hour (3600 seconds)
          await this.redisService.set(redisCacheKey, diagram, 3600);

          logger.info(`Stored diagram for project ${projectId} in Redis`);
        } catch (error) {
          logger.error(
            `Error fetching diagram for project ${projectId}: ${error}`
          );
          // If there's an error, create an empty diagram
          diagram = { Nodes: [], Edges: [] };
        }
      } else {
        logger.info(`Using cached diagram for project ${projectId} from Redis`);
      }

      // Send the diagram to the user who just joined
      socket.emit('DIAGRAM:INITIAL', diagram);
    } catch (error) {
      logger.error(`Error in handleProjectJoin: ${error}`);
    }
  }

  /**
   * Handle diagram update event
   * @param socket The socket that sent the update
   * @param projectId The project ID
   * @param diagram The updated diagram
   */
  private async handleDiagramUpdate(
    socket: Socket,
    projectId: string,
    diagram: Record<string, unknown>
  ): Promise<void> {
    try {
      logger.info(`Received diagram update for project ${projectId}`);

      // Update the diagram in Redis
      const redisCacheKey = `project:diagram:${projectId}`;
      await this.redisService.set(redisCacheKey, diagram, 3600);

      // Broadcast the update to all other users in the project
      socket.to(projectId).emit('DIAGRAM:UPDATE', diagram);
    } catch (error) {
      logger.error(`Error in handleDiagramUpdate: ${error}`);
    }
  }

  /**
   * Handle node added event
   * @param socket The socket that sent the node
   * @param projectId The project ID
   * @param node The new node that was added
   */
  private async handleNodeAdded(
    socket: Socket,
    projectId: string,
    node: INode
  ): Promise<void> {
    try {
      logger.info(`Node ${node.id} added to project ${projectId}`);

      // Get the current diagram from Redis
      const redisCacheKey = `project:diagram:${projectId}`;
      const diagram =
        await this.redisService.get<Record<string, unknown>>(redisCacheKey);

      if (diagram) {
        // Add the new node to the diagram
        const nodes = (diagram.Nodes || []) as INode[];
        nodes.push(node);
        diagram.Nodes = nodes;

        // Update the diagram in Redis
        await this.redisService.set(redisCacheKey, diagram, 3600);
      }

      // Broadcast the new node to all other users in the project
      socket.to(projectId).emit('DIAGRAM:NODE_ADDED', node);
    } catch (error) {
      logger.error(`Error in handleNodeAdded: ${error}`);
    }
  }

  /**
   * Handle node delete event
   * @param socket The socket that send the node
   * @param projectId The project ID
   * @param nodeId the ID of the node to delete
   */
  private async handleDeleteNode(
    socket: Socket,
    projectId: string,
    nodeId: string
  ): Promise<void> {
    try {
      // Get the current diagram from Redis
      const redisCacheKey = `project:diagram:${projectId}`;
      const diagram =
        await this.redisService.get<Record<string, unknown>>(redisCacheKey);

      if (diagram?.Nodes) {
        const nodes = diagram.Nodes as INode[];
        const updatedNodes = nodes.filter((node) => node.id !== nodeId);
        diagram.Nodes = updatedNodes;
        await this.redisService.set(redisCacheKey, diagram, 3600);
      }

      // Broadcast the node deletion to all other users in the project
      socket.to(projectId).emit('DIAGRAM:NODE_DELETED', { nodeId });
    } catch (error) {
      logger.error(`Error in handleNodeAdded: ${error}`);
    }
  }

  /**
   * Handle node label change
   * @param socket The socket that sent the node
   * @param projectId The project ID
   * @param nodeId The ID of the node
   * @param label The new label for the node
   */
  private async handleNodeLabelChange(
    socket: Socket,
    projectId: string,
    nodeId: string,
    label: string
  ): Promise<void> {
    try {
      // Get the current diagram from Redis
      const redisCacheKey = `project:diagram:${projectId}`;
      const diagram =
        await this.redisService.get<Record<string, unknown>>(redisCacheKey);

      if (diagram?.Nodes) {
        const nodes = diagram.Nodes as INode[];
        const updatedNodes = nodes.map((node) => {
          if (node.id === nodeId) {
            return { ...node, data: { ...node.data, label } };
          }
          return node;
        });

        diagram.Nodes = updatedNodes;
        await this.redisService.set(redisCacheKey, diagram, 3600);
      }

      // Broadcast the node label change to all other users in the project
      socket
        .to(projectId)
        .emit('DIAGRAM:NODE_LABEL_CHANGED', { nodeId, label });
    } catch (error) {
      logger.error(`Error in handleNodeLabelChange: ${error}`);
    }
  }

  /**
   * Handle node label change
   * @param socket The socket that sent the node
   * @param projectId The project ID
   * @param nodeId The ID of the node
   * @param description The new label for the node
   */
  private async handleNodeDescriptionChange(
    socket: Socket,
    projectId: string,
    nodeId: string,
    description: string
  ): Promise<void> {
    try {
      // Get the current diagram from Redis
      const redisCacheKey = `project:diagram:${projectId}`;
      const diagram =
        await this.redisService.get<Record<string, unknown>>(redisCacheKey);

      if (diagram?.Nodes) {
        const nodes = diagram.Nodes as INode[];
        const updatedNodes = nodes.map((node) => {
          if (node.id === nodeId) {
            return { ...node, data: { ...node.data, description } };
          }
          return node;
        });

        diagram.Nodes = updatedNodes;
        await this.redisService.set(redisCacheKey, diagram, 3600);
      }

      // Broadcast the node label change to all other users in the project
      socket
        .to(projectId)
        .emit('DIAGRAM:NODE_DESCRIPTION_CHANGED', { nodeId, description });
    } catch (error) {
      logger.error(`Error in handleNodeDescriptionChange: ${error}`);
    }
  }

  /**
   * Handle add fields to Node
   * @param socket The socket that sent the node
   * @param projectId The project ID
   * @param nodeId The ID of the node
   * @param fields The fields to add to the node
   */
  private async handleAddFieldsToNode(
    socket: Socket,
    projectId: string,
    nodeId: string,
    fields: TField[]
  ): Promise<void> {
    try {
      // Get the current diagram from Redis
      const redisCacheKey = `project:diagram:${projectId}`;
      const diagram =
        await this.redisService.get<Record<string, unknown>>(redisCacheKey);

      if (diagram?.Nodes) {
        const nodes = diagram.Nodes as INode[];
        const updatedNodes = nodes.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: { ...node.data, fields: [...node.data.fields, ...fields] }
            };
          }
          return node;
        });

        diagram.Nodes = updatedNodes;
        await this.redisService.set(redisCacheKey, diagram, 3600);
      }

      // Broadcast the node label change to all other users in the project
      socket.to(projectId).emit('DIAGRAM:ADD_NODE_FIELDS', { nodeId, fields });
    } catch (error) {
      logger.error(`Error in handleAddFieldsToNode: ${error}`);
    }
  }

  /**
   * Handle delete fields from Node
   * @param socket The socket that sent the node
   * @param projectId The project ID
   * @param nodeId The ID of the node
   * @param fieldId The ID of the field to delete
   */
  private async handleFieldDeleteFromNode(
    socket: Socket,
    projectId: string,
    nodeId: string,
    fieldId: string
  ): Promise<void> {
    try {
      // Get the current diagram from Redis
      const redisCacheKey = `project:diagram:${projectId}`;
      const diagram =
        await this.redisService.get<Record<string, unknown>>(redisCacheKey);

      if (diagram?.Nodes) {
        const nodes = diagram.Nodes as INode[];
        const updatedNodes = nodes.map((node) => {
          if (node.id === nodeId) {
            const updatedField = node?.data.fields.filter(
              (field) => field.id !== fieldId
            );

            return {
              ...node,
              data: { ...node.data, fields: updatedField }
            };
          }
          return node;
        });

        diagram.Nodes = updatedNodes;
        await this.redisService.set(redisCacheKey, diagram, 3600);
      }

      // Broadcast the node field delete to all other user in the project
      socket
        .to(projectId)
        .emit('DIAGRAM:DELETE_NODE_FIELD', { nodeId, fieldId });
    } catch (error) {
      logger.error(`Error in handleFieldDeleteFromNode: ${error}`);
    }
  }
}
