import { Server, Socket } from 'socket.io';
import { ISocketEventHandler } from '../../core/interfaces/ISocketEventHandler';
import { IRedisService } from '../../core/interfaces/IRedisService';
import { S3Service } from '../services/s3/services/S3Service';
import { IEdge, INode } from '../../definitions/interface';
import logger from '../../utils/logger';
import { TField, XYPosition } from '../../definitions/type';

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

    socket.on(
      'PROJECT:LEAVE',
      async ({
        projectId,
        userName
      }: {
        projectId: string;
        userName: string;
      }) => {
        await this.handleProjectLeave(socket, projectId, userName);
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

    // Handle editor mouse move event
    socket.on(
      'EDITOR:MOUSE_MOVE',
      async ({
        projectId,
        userId,
        userName,
        position
      }: {
        projectId: string;
        userId: string;
        userName: string;
        position: { x: number; y: number };
      }) => {
        await this.handleEditorMouseMove(
          socket,
          projectId,
          userId,
          userName,
          position
        );
      }
    );

    // handle node drag event
    socket.on(
      'DIAGRAM:NODE_DRAG',
      async ({
        projectId,
        nodeId,
        position
      }: {
        projectId: string;
        nodeId: string;
        position: { x: number; y: number };
      }) => {
        await this.handleNodeMovement(socket, projectId, nodeId, position);
      }
    );

    // Handle node drag stop event
    socket.on(
      'DIAGRAM:NODE_DRAG_STOP',
      async ({
        projectId,
        nodeId,
        position
      }: {
        projectId: string;
        nodeId: string;
        position: { x: number; y: number };
      }) => {
        await this.handleNodeDragStop(socket, projectId, nodeId, position);
      }
    );

    // Handle edge add event
    socket.on(
      'DIAGRAM:EDGE_ADDED',
      async ({ projectId, edge }: { projectId: string; edge: IEdge }) => {
        await this.handleEdgeAdd(socket, projectId, edge);
      }
    );

    // Handle edge delete event
    socket.on(
      'DIAGRAM:EDGE_DELETED',
      async ({ projectId, edgeId }: { projectId: string; edgeId: string }) => {
        await this.handleEdgeDelete(socket, projectId, edgeId);
      }
    );

    // Handle edge update event
    socket.on(
      'DIAGRAM:EDGE_UPDATE',
      async ({
        projectId,
        edgeId,
        property,
        value
      }: {
        projectId: string;
        edgeId: string;
        property: string;
        value: string | number | unknown;
      }) => {
        await this.handleEdgeUpdate(socket, projectId, edgeId, property, value);
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

  private async handleProjectLeave(
    socket: Socket,
    projectId: string,
    userName: string
  ) {
    try {
      logger.info(`User ${userName} left project ${projectId}`);

      // Leave the room for this project
      socket.leave(projectId);

      // Remove user from project users list
      const users = this.projectsUsersDetails.get(projectId);
      if (users) {
        const userIndex = users.findIndex(
          (user) => user.socketId === socket.id
        );
        if (userIndex !== -1) {
          users.splice(userIndex, 1);
          this.projectsUsersDetails.set(projectId, users);
        }
      }

      // Emit updated user count to all users in the project
      this.io.to(projectId).emit('PROJECT:USER_COUNT', users);
    } catch (error) {
      logger.error(`Error in handleProjectLeave: ${error}`);
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

  /**
   * Handle editor mouse move event
   * @param socket The socket that sent the mouse position
   * @param projectId The project ID
   * @param userId The user ID
   * @param userName The user name
   * @param position The mouse position coordinates
   */
  private async handleEditorMouseMove(
    socket: Socket,
    projectId: string,
    userId: string,
    userName: string,
    position: { x: number; y: number }
  ): Promise<void> {
    try {
      // Broadcast the mouse position to all other users in the project
      socket.to(projectId).emit('EDITOR:MOUSE_MOVE', {
        userId,
        userName,
        position,
        projectId
      });
    } catch (error) {
      logger.error(`Error in handleEditorMouseMove: ${error}`);
    }
  }

  /**
   * Handle node movement in editor
   * @param socket The socket that sent the node position
   * @param projectId the project Id
   * @param nodeId the node Id
   * @param position the new position of the node
   */
  private async handleNodeMovement(
    socket: Socket,
    projectId: string,
    nodeId: string,
    position: XYPosition
  ): Promise<void> {
    // Broadcast the node movement to all other users in the project
    socket.to(projectId).emit('DIAGRAM:NODE_DRAG', { nodeId, position });
  }

  /**
   * Handle node drag stop event
   * @param socket the socket that send the node position
   * @param projectId the project
   * @param nodeId the id of the node
   * @param position the new position of the node
   */
  private async handleNodeDragStop(
    socket: Socket,
    projectId: string,
    nodeId: string,
    position: XYPosition
  ): Promise<void> {
    const redisCacheKey = `project:diagram:${projectId}`;
    const diagram =
      await this.redisService.get<Record<string, unknown>>(redisCacheKey);

    if (diagram?.Nodes) {
      const nodes = diagram?.Nodes as INode[];
      const updatedNodes = nodes.map((node) => {
        if (node.id === nodeId) {
          return { ...node, position };
        }
        return node;
      });

      diagram.Nodes = updatedNodes;
      await this.redisService.set(redisCacheKey, diagram, 3600);
    }

    // Broadcast the node movement to all other users in the project
    socket.to(projectId).emit('DIAGRAM:NODE_DRAG_STOP', { nodeId, position });
  }

  /**
   * Handle edge addition event
   * @param socket The socket that sent the edge
   * @param projectId The project ID
   * @param edge The new edge that was added
   */
  private async handleEdgeAdd(
    socket: Socket,
    projectId: string,
    edge: IEdge
  ): Promise<void> {
    const redisCacheKey = `project:diagram:${projectId}`;
    const diagram =
      await this.redisService.get<Record<string, unknown>>(redisCacheKey);

    if (diagram) {
      if (diagram.Edges) {
        const edges = diagram.Edges as IEdge[];
        const updatedEdges = [...edges, edge];
        diagram.Edges = updatedEdges;
      } else {
        diagram.Edges = [edge];
      }

      // if sourceHanle is there add update the reference propert of the schema
      if (edge.sourceHandle) {
        const sourceHandle = edge.sourceHandle.split('-')[0];

        const nodes = diagram.Nodes as INode[];
        const targeNodeLabel = nodes.find((value) => value?.id === edge.target)
          ?.data?.label;

        const updatedNodes = nodes?.map((node) => {
          if (node.id === edge.source) {
            return {
              ...node,
              data: {
                ...node.data,
                fields: node.data.fields.map((field) => {
                  if (field.name === sourceHandle) {
                    return { ...field, ref: targeNodeLabel };
                  }
                  return field;
                })
              }
            };
          }
          return node;
        });
        diagram.Nodes = updatedNodes;
      }

      await this.redisService.set(redisCacheKey, diagram, 3600);
    }

    // Broadcast the edge addition to all other users in the project
    socket.to(projectId).emit('DIAGRAM:EDGE_ADDED', edge);
  }

  /**
   * Handle edge deletion event
   * @param socket The socket that sent the edge ID
   * @param projectId The project ID
   * @param edgeId The ID of the edge to delete
   */
  private async handleEdgeDelete(
    socket: Socket,
    projectId: string,
    edgeId: string
  ): Promise<void> {
    const redisCacheKey = `project:diagram:${projectId}`;
    const diagram =
      await this.redisService.get<Record<string, unknown>>(redisCacheKey);

    if (diagram?.Edges) {
      const edges = diagram.Edges as IEdge[];
      const updatedEdges = edges.filter((edge) => edge.id !== edgeId);

      const deleteEdge = edges.find((e) => e.id == edgeId);

      // if the reference is there is there after delete the edge then delete the reference too
      if (deleteEdge?.sourceHandle) {
        const source = deleteEdge?.source;
        const sourceHandle = deleteEdge?.sourceHandle.split('-')[0];

        const nodes = diagram.Nodes as INode[];
        const updatedNodes = nodes?.map((node) => {
          if (node.id === source) {
            return {
              ...node,
              data: {
                ...node.data,
                fields: node.data.fields.map((field) => {
                  if (field.name === sourceHandle) {
                    return { ...field, ref: '' };
                  }
                  return field;
                })
              }
            };
          }
          return node;
        });
        diagram.Nodes = updatedNodes;
      }

      diagram.Edges = updatedEdges;
      await this.redisService.set(redisCacheKey, diagram, 3600);
    }

    socket.to(projectId).emit('DIAGRAM:EDGE_DELETED', { edgeId });
  }

  /**
   * Handle edge update event
   * @param socket The socket that sent the edge update
   * @param projectId The project ID
   * @param edgeId The ID of the edge to update
   * @param property The property to update
   * @param value The new value for the property
   */
  private async handleEdgeUpdate(
    socket: Socket,
    projectId: string,
    edgeId: string,
    property: string,
    value: string | number | unknown
  ): Promise<void> {
    const redisCacheKey = `project:diagram:${projectId}`;
    const diagram =
      await this.redisService.get<Record<string, unknown>>(redisCacheKey);

    if (diagram?.Edges) {
      const edges = diagram.Edges as IEdge[];
      const updatedEdges = edges.map((edge) => {
        if (edge.id === edgeId) {
          let updatedEdge;
          // For label property, ensure we're not creating new key-pairs
          if (property === 'label') {
            updatedEdge = {
              ...edge,
              label: value // Explicitly update the label property
            };
          }

          // Handle other properties normally
          updatedEdge = {
            ...edge,
            [property]: value
          };

          return updatedEdge;
        }
        return edge;
      });

      diagram.Edges = updatedEdges;
      await this.redisService.set(redisCacheKey, diagram, 3600);
    }

    socket
      .to(projectId)
      .emit('DIAGRAM:EDGE_UPDATE', { edgeId, property, value });
  }
}
