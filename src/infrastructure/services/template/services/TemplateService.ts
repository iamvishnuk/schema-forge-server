import { ProjectTemplateEnum } from '../../../../core/entities/project.entity';
import { ITemplateService } from '../interface/ITemplateService';

/**
 * Template service implementation that provides predefined project templates
 */
export class TemplateService implements ITemplateService {
  private templateDescriptions = {
    [ProjectTemplateEnum.NONE]: 'Empty project with no predefined schema',
    [ProjectTemplateEnum.BLOG]:
      'Blog platform with users, posts, comments, and categories',
    [ProjectTemplateEnum.ECOMMERCE]:
      'E-commerce platform with products, users, orders, and inventory',
    [ProjectTemplateEnum.CRM]:
      'Customer Relationship Management with contacts, leads, and deals',
    [ProjectTemplateEnum.SOCIAL_NETWORK]:
      'Social network with users, posts, comments, and friend connections',
    [ProjectTemplateEnum.TASK_MANAGER]:
      'Task management system with projects, tasks, and user assignments'
  };

  /**
   * Get all available templates with descriptions
   */
  async getAvailableTemplates(): Promise<
    Array<{ type: string; description: string }>
  > {
    return Object.entries(this.templateDescriptions).map(
      ([type, description]) => ({
        type,
        description
      })
    );
  }

  /**
   * Get the predefined template diagram for a specific project type
   * @param templateType The template type to retrieve
   * @returns The template diagram data for the specified type
   */
  async getTemplateDesign(
    templateType: string
  ): Promise<Record<string, unknown>> {
    switch (templateType) {
      case ProjectTemplateEnum.BLOG:
        return this.getBlogTemplate();
      case ProjectTemplateEnum.ECOMMERCE:
        return this.getEcommerceTemplate();
      case ProjectTemplateEnum.CRM:
        return this.getCrmTemplate();
      case ProjectTemplateEnum.SOCIAL_NETWORK:
        return this.getSocialNetworkTemplate();
      case ProjectTemplateEnum.TASK_MANAGER:
        return this.getTaskManagerTemplate();
      case ProjectTemplateEnum.NONE:
      default:
        return { Nodes: [], Edges: [] };
    }
  }

  /**
   * Get blog template with users, posts, comments, and categories
   */
  private getBlogTemplate(): Record<string, unknown> {
    return {
      Nodes: [
        {
          id: 'a1b2c3d4-e5f6-4a5b-9c8d-7e6f5d4c3b2a',
          type: 'collection',
          position: {
            x: -603.4824365764684,
            y: -108.35419526915788
          },
          data: {
            label: 'Users',
            fields: [
              {
                id: 'u1-id-field',
                name: '_id',
                type: 'ObjectId',
                isPrimary: true,
                required: true
              },
              {
                id: 'u2-username-field',
                name: 'username',
                type: 'String',
                required: true,
                isPrimary: false,
                isUnique: true,
                index: true,
                ref: ''
              },
              {
                id: 'u3-email-field',
                name: 'email',
                type: 'String',
                required: true,
                isPrimary: false,
                isUnique: true,
                index: true,
                ref: ''
              },
              {
                id: 'u4-password-field',
                name: 'password',
                type: 'String',
                required: true,
                isPrimary: false,
                isUnique: false,
                index: false,
                ref: ''
              },
              {
                id: 'u5-name-field',
                name: 'displayName',
                type: 'String',
                required: true,
                isPrimary: false,
                isUnique: false,
                index: false,
                ref: ''
              },
              {
                id: 'u6-bio-field',
                name: 'bio',
                type: 'String',
                required: false,
                isPrimary: false,
                isUnique: false,
                index: false,
                ref: ''
              },
              {
                id: 'u7-avatar-field',
                name: 'avatarUrl',
                type: 'String',
                required: false,
                isPrimary: false,
                isUnique: false,
                index: false,
                ref: ''
              },
              {
                id: 'u8-role-field',
                name: 'role',
                type: 'String',
                required: true,
                isPrimary: false,
                isUnique: false,
                index: true,
                ref: ''
              },
              {
                id: 'u9-created-field',
                name: 'createdAt',
                type: 'Date',
                required: true,
                isPrimary: false,
                isUnique: false,
                index: false,
                ref: ''
              }
            ]
          }
        },
        {
          id: 'b2c3d4e5-f6a5-5b9c-8d7e-6f5d4c3b2a1',
          type: 'collection',
          position: {
            x: -323.1206876092896,
            y: -25.142329571474733
          },
          data: {
            label: 'Articles',
            fields: [
              {
                id: 'a1-id-field',
                name: '_id',
                type: 'ObjectId',
                isPrimary: true,
                required: true
              },
              {
                id: 'a2-title-field',
                name: 'title',
                type: 'String',
                required: true,
                isPrimary: false,
                isUnique: false,
                index: true,
                ref: ''
              },
              {
                id: 'a3-slug-field',
                name: 'slug',
                type: 'String',
                required: true,
                isPrimary: false,
                isUnique: true,
                index: true,
                ref: ''
              },
              {
                id: 'a4-content-field',
                name: 'content',
                type: 'String',
                required: true,
                isPrimary: false,
                isUnique: false,
                index: false,
                ref: ''
              },
              {
                id: 'a5-excerpt-field',
                name: 'excerpt',
                type: 'String',
                required: false,
                isPrimary: false,
                isUnique: false,
                index: false,
                ref: ''
              },
              {
                id: 'a6-authorId-field',
                name: 'authorId',
                type: 'ObjectId',
                required: true,
                isPrimary: false,
                isUnique: false,
                index: true,
                ref: ''
              },
              {
                id: 'a7-featured-field',
                name: 'featuredImage',
                type: 'String',
                required: false,
                isPrimary: false,
                isUnique: false,
                index: false,
                ref: ''
              },
              {
                id: 'a8-status-field',
                name: 'status',
                type: 'String',
                required: true,
                isPrimary: false,
                isUnique: false,
                index: true,
                ref: ''
              },
              {
                id: 'a9-published-field',
                name: 'publishedAt',
                type: 'Date',
                required: false,
                isPrimary: false,
                isUnique: false,
                index: true,
                ref: ''
              },
              {
                id: 'a10-created-field',
                name: 'createdAt',
                type: 'Date',
                required: true,
                isPrimary: false,
                isUnique: false,
                index: false,
                ref: ''
              },
              {
                id: 'a11-updated-field',
                name: 'updatedAt',
                type: 'Date',
                required: true,
                isPrimary: false,
                isUnique: false,
                index: false,
                ref: ''
              },
              {
                id: 'a12-tags-field',
                name: 'tagIds',
                type: 'Array',
                arrayType: 'ObjectId',
                required: false,
                isPrimary: false,
                isUnique: false,
                index: false,
                ref: ''
              },
              {
                id: 'a13-category-field',
                name: 'categoryId',
                type: 'ObjectId',
                required: true,
                isPrimary: false,
                isUnique: false,
                index: true,
                ref: ''
              }
            ]
          }
        },
        {
          id: 'c3d4e5f6-a5b9-c8d7-e6f5-d4c3b2a1b2',
          type: 'collection',
          position: {
            x: -607.3494222276385,
            y: 508.2764508783247
          },
          data: {
            label: 'Categories',
            fields: [
              {
                id: 'c1-id-field',
                name: '_id',
                type: 'ObjectId',
                isPrimary: true,
                required: true
              },
              {
                id: 'c2-name-field',
                name: 'name',
                type: 'String',
                required: true,
                isPrimary: false,
                isUnique: true,
                index: true,
                ref: ''
              },
              {
                id: 'c3-slug-field',
                name: 'slug',
                type: 'String',
                required: true,
                isPrimary: false,
                isUnique: true,
                index: true,
                ref: ''
              },
              {
                id: 'c4-description-field',
                name: 'description',
                type: 'String',
                required: false,
                isPrimary: false,
                isUnique: false,
                index: false,
                ref: ''
              },
              {
                id: 'c5-parent-field',
                name: 'parentCategoryId',
                type: 'ObjectId',
                required: false,
                isPrimary: false,
                isUnique: false,
                index: true,
                ref: ''
              },
              {
                id: 'c6-created-field',
                name: 'createdAt',
                type: 'Date',
                required: true,
                isPrimary: false,
                isUnique: false,
                index: false,
                ref: ''
              }
            ]
          }
        },
        {
          id: 'd4e5f6a5-b9c8-d7e6-f5d4-c3b2a1b2c3',
          type: 'collection',
          position: {
            x: -56.53452677784014,
            y: 179.12811564078876
          },
          data: {
            label: 'Comments',
            fields: [
              {
                id: 'com1-id-field',
                name: '_id',
                type: 'ObjectId',
                isPrimary: true,
                required: true
              },
              {
                id: 'com2-article-field',
                name: 'articleId',
                type: 'ObjectId',
                required: true,
                isPrimary: false,
                isUnique: false,
                index: true,
                ref: ''
              },
              {
                id: 'com3-author-field',
                name: 'authorId',
                type: 'ObjectId',
                required: true,
                isPrimary: false,
                isUnique: false,
                index: true,
                ref: ''
              },
              {
                id: 'com4-content-field',
                name: 'content',
                type: 'String',
                required: true,
                isPrimary: false,
                isUnique: false,
                index: false,
                ref: ''
              },
              {
                id: 'com5-parent-field',
                name: 'parentCommentId',
                type: 'ObjectId',
                required: false,
                isPrimary: false,
                isUnique: false,
                index: true,
                ref: ''
              },
              {
                id: 'com6-status-field',
                name: 'status',
                type: 'String',
                required: true,
                isPrimary: false,
                isUnique: false,
                index: true,
                ref: ''
              },
              {
                id: 'com7-created-field',
                name: 'createdAt',
                type: 'Date',
                required: true,
                isPrimary: false,
                isUnique: false,
                index: true,
                ref: ''
              }
            ]
          }
        },
        {
          id: 'e5f6a5b9-c8d7-e6f5-d4c3-b2a1b2c3d4',
          type: 'collection',
          position: {
            x: -274.4453056672204,
            y: 632.9784891197389
          },
          data: {
            label: 'Tags',
            fields: [
              {
                id: 't1-id-field',
                name: '_id',
                type: 'ObjectId',
                isPrimary: true,
                required: true
              },
              {
                id: 't2-name-field',
                name: 'name',
                type: 'String',
                required: true,
                isPrimary: false,
                isUnique: true,
                index: true,
                ref: ''
              },
              {
                id: 't3-slug-field',
                name: 'slug',
                type: 'String',
                required: true,
                isPrimary: false,
                isUnique: true,
                index: true,
                ref: ''
              },
              {
                id: 't4-description-field',
                name: 'description',
                type: 'String',
                required: false,
                isPrimary: false,
                isUnique: false,
                index: false,
                ref: ''
              },
              {
                id: 't5-created-field',
                name: 'createdAt',
                type: 'Date',
                required: true,
                isPrimary: false,
                isUnique: false,
                index: false,
                ref: ''
              }
            ]
          }
        },
        {
          id: 'f6a5b9c8-d7e6-f5d4-c3b2-a1b2c3d4e5',
          type: 'collection',
          position: {
            x: -565.0042889066659,
            y: -491.0334199429039
          },
          data: {
            label: 'Media',
            fields: [
              {
                id: 'm1-id-field',
                name: '_id',
                type: 'ObjectId',
                isPrimary: true,
                required: true
              },
              {
                id: 'm2-filename-field',
                name: 'filename',
                type: 'String',
                required: true,
                isPrimary: false,
                isUnique: false,
                index: false,
                ref: ''
              },
              {
                id: 'm3-path-field',
                name: 'path',
                type: 'String',
                required: true,
                isPrimary: false,
                isUnique: true,
                index: true,
                ref: ''
              },
              {
                id: 'm4-mimetype-field',
                name: 'mimeType',
                type: 'String',
                required: true,
                isPrimary: false,
                isUnique: false,
                index: true,
                ref: ''
              },
              {
                id: 'm5-size-field',
                name: 'size',
                type: 'Number',
                required: true,
                isPrimary: false,
                isUnique: false,
                index: false,
                ref: ''
              },
              {
                id: 'm6-uploaded-field',
                name: 'uploadedBy',
                type: 'ObjectId',
                required: true,
                isPrimary: false,
                isUnique: false,
                index: true,
                ref: ''
              },
              {
                id: 'm7-created-field',
                name: 'createdAt',
                type: 'Date',
                required: true,
                isPrimary: false,
                isUnique: false,
                index: true,
                ref: ''
              }
            ]
          }
        },
        {
          id: 'a5b9c8d7-e6f5-d4c3-b2a1-b2c3d4e5f6',
          type: 'collection',
          position: {
            x: -864.97271612748,
            y: 147.54436065445483
          },
          data: {
            label: 'Subscriptions',
            fields: [
              {
                id: 's1-id-field',
                name: '_id',
                type: 'ObjectId',
                isPrimary: true,
                required: true
              },
              {
                id: 's2-email-field',
                name: 'email',
                type: 'String',
                required: true,
                isPrimary: false,
                isUnique: true,
                index: true,
                ref: ''
              },
              {
                id: 's3-name-field',
                name: 'name',
                type: 'String',
                required: false,
                isPrimary: false,
                isUnique: false,
                index: false,
                ref: ''
              },
              {
                id: 's4-status-field',
                name: 'status',
                type: 'String',
                required: true,
                isPrimary: false,
                isUnique: false,
                index: true,
                ref: ''
              },
              {
                id: 's5-token-field',
                name: 'confirmToken',
                type: 'String',
                required: false,
                isPrimary: false,
                isUnique: true,
                index: true,
                ref: ''
              },
              {
                id: 's6-created-field',
                name: 'createdAt',
                type: 'Date',
                required: true,
                isPrimary: false,
                isUnique: false,
                index: true,
                ref: ''
              }
            ]
          }
        },
        {
          id: 'b9c8d7e6-f5d4-c3b2-a1b2-c3d4e5f6a5',
          type: 'collection',
          position: {
            x: -127.14044567732716,
            y: -487.4381584066838
          },
          data: {
            label: 'Analytics',
            fields: [
              {
                id: 'an1-id-field',
                name: '_id',
                type: 'ObjectId',
                isPrimary: true,
                required: true
              },
              {
                id: 'an2-article-field',
                name: 'articleId',
                type: 'ObjectId',
                required: true,
                isPrimary: false,
                isUnique: false,
                index: true,
                ref: ''
              },
              {
                id: 'an3-views-field',
                name: 'views',
                type: 'Number',
                required: true,
                isPrimary: false,
                isUnique: false,
                index: false,
                ref: ''
              },
              {
                id: 'an4-likes-field',
                name: 'likes',
                type: 'Number',
                required: true,
                isPrimary: false,
                isUnique: false,
                index: false,
                ref: ''
              },
              {
                id: 'an5-shares-field',
                name: 'shares',
                type: 'Number',
                required: true,
                isPrimary: false,
                isUnique: false,
                index: false,
                ref: ''
              },
              {
                id: 'an6-avgtime-field',
                name: 'avgReadTime',
                type: 'Number',
                required: false,
                isPrimary: false,
                isUnique: false,
                index: false,
                ref: ''
              },
              {
                id: 'an7-lastupdate-field',
                name: 'lastUpdated',
                type: 'Date',
                required: true,
                isPrimary: false,
                isUnique: false,
                index: true,
                ref: ''
              }
            ]
          }
        },
        {
          id: 'c8d7e6f5-d4c3-b2a1-b2c3-d4e5f6a5b9',
          type: 'collection',
          position: {
            x: 112.40132958581952,
            y: 523.0694554331776
          },
          data: {
            label: 'Settings',
            fields: [
              {
                id: 'set1-id-field',
                name: '_id',
                type: 'ObjectId',
                isPrimary: true,
                required: true
              },
              {
                id: 'set2-key-field',
                name: 'key',
                type: 'String',
                required: true,
                isPrimary: false,
                isUnique: true,
                index: true,
                ref: ''
              },
              {
                id: 'set3-value-field',
                name: 'value',
                type: 'Mixed',
                required: true,
                isPrimary: false,
                isUnique: false,
                index: false,
                ref: ''
              },
              {
                id: 'set4-group-field',
                name: 'group',
                type: 'String',
                required: false,
                isPrimary: false,
                isUnique: false,
                index: true,
                ref: ''
              },
              {
                id: 'set5-updated-field',
                name: 'updatedAt',
                type: 'Date',
                required: true,
                isPrimary: false,
                isUnique: false,
                index: false,
                ref: ''
              },
              {
                id: 'set6-updatedby-field',
                name: 'updatedBy',
                type: 'ObjectId',
                required: true,
                isPrimary: false,
                isUnique: false,
                index: true,
                ref: ''
              }
            ]
          }
        }
      ],
      Edges: [
        {
          source: 'b2c3d4e5-f6a5-5b9c-8d7e-6f5d4c3b2a1',
          sourceHandle: 'authorId-source',
          target: 'a1b2c3d4-e5f6-4a5b-9c8d-7e6f5d4c3b2a',
          targetHandle: null,
          id: 'edge1-article-user',
          animated: true,
          type: 'step',
          label: 'written by',
          markerEnd: {
            type: 'arrowclosed'
          },
          style: {
            stroke: '#155dfc',
            strokeWidth: 1
          }
        },
        {
          source: 'b2c3d4e5-f6a5-5b9c-8d7e-6f5d4c3b2a1',
          sourceHandle: 'categoryId-source',
          target: 'c3d4e5f6-a5b9-c8d7-e6f5-d4c3b2a1b2',
          targetHandle: null,
          id: 'edge2-article-category',
          animated: true,
          type: 'step',
          label: 'belongs to',
          markerEnd: {
            type: 'arrowclosed'
          },
          style: {
            stroke: '#155dfc',
            strokeWidth: 1
          }
        },
        {
          source: 'c3d4e5f6-a5b9-c8d7-e6f5-d4c3b2a1b2',
          sourceHandle: 'parentCategoryId-source',
          target: 'c3d4e5f6-a5b9-c8d7-e6f5-d4c3b2a1b2',
          targetHandle: null,
          id: 'edge3-category-parent',
          animated: true,
          type: 'step',
          label: 'parent of',
          markerEnd: {
            type: 'arrowclosed'
          },
          style: {
            stroke: '#155dfc',
            strokeWidth: 1
          }
        },
        {
          source: 'd4e5f6a5-b9c8-d7e6-f5d4-c3b2a1b2c3',
          sourceHandle: 'articleId-source',
          target: 'b2c3d4e5-f6a5-5b9c-8d7e-6f5d4c3b2a1',
          targetHandle: null,
          id: 'edge4-comment-article',
          animated: true,
          type: 'step',
          label: 'belongs to',
          markerEnd: {
            type: 'arrowclosed'
          },
          style: {
            stroke: '#155dfc',
            strokeWidth: 1
          }
        },
        {
          source: 'd4e5f6a5-b9c8-d7e6-f5d4-c3b2a1b2c3',
          sourceHandle: 'authorId-source',
          target: 'a1b2c3d4-e5f6-4a5b-9c8d-7e6f5d4c3b2a',
          targetHandle: null,
          id: 'edge5-comment-user',
          animated: true,
          type: 'step',
          label: 'written by',
          markerEnd: {
            type: 'arrowclosed'
          },
          style: {
            stroke: '#155dfc',
            strokeWidth: 1
          }
        },
        {
          source: 'd4e5f6a5-b9c8-d7e6-f5d4-c3b2a1b2c3',
          sourceHandle: 'parentCommentId-source',
          target: 'd4e5f6a5-b9c8-d7e6-f5d4-c3b2a1b2c3',
          targetHandle: null,
          id: 'edge6-comment-parent',
          animated: true,
          type: 'step',
          label: 'reply to',
          markerEnd: {
            type: 'arrowclosed'
          },
          style: {
            stroke: '#155dfc',
            strokeWidth: 1
          }
        },
        {
          source: 'b2c3d4e5-f6a5-5b9c-8d7e-6f5d4c3b2a1',
          sourceHandle: 'tagIds-source',
          target: 'e5f6a5b9-c8d7-e6f5-d4c3-b2a1b2c3d4',
          targetHandle: null,
          id: 'edge7-article-tags',
          animated: true,
          type: 'step',
          label: 'has many',
          markerEnd: {
            type: 'arrowclosed'
          },
          style: {
            stroke: '#155dfc',
            strokeWidth: 1
          }
        },
        {
          source: 'f6a5b9c8-d7e6-f5d4-c3b2-a1b2c3d4e5',
          sourceHandle: 'uploadedBy-source',
          target: 'a1b2c3d4-e5f6-4a5b-9c8d-7e6f5d4c3b2a',
          targetHandle: null,
          id: 'edge8-media-user',
          animated: true,
          type: 'step',
          label: 'uploaded by',
          markerEnd: {
            type: 'arrowclosed'
          },
          style: {
            stroke: '#155dfc',
            strokeWidth: 1
          }
        },
        {
          source: 'b9c8d7e6-f5d4-c3b2-a1b2-c3d4e5f6a5',
          sourceHandle: 'articleId-source',
          target: 'b2c3d4e5-f6a5-5b9c-8d7e-6f5d4c3b2a1',
          targetHandle: null,
          id: 'edge9-analytics-article',
          animated: true,
          type: 'step',
          label: 'tracks',
          markerEnd: {
            type: 'arrowclosed'
          },
          style: {
            stroke: '#155dfc',
            strokeWidth: 1
          }
        },
        {
          source: 'c8d7e6f5-d4c3-b2a1-b2c3-d4e5f6a5b9',
          sourceHandle: 'updatedBy-source',
          target: 'a1b2c3d4-e5f6-4a5b-9c8d-7e6f5d4c3b2a',
          targetHandle: null,
          id: 'edge10-settings-user',
          animated: true,
          type: 'step',
          label: 'modified by',
          markerEnd: {
            type: 'arrowclosed'
          },
          style: {
            stroke: '#155dfc',
            strokeWidth: 1
          }
        }
      ]
    };
  }

  /**
   * Get e-commerce template with products, users, orders, and inventory
   */
  private getEcommerceTemplate(): Record<string, unknown> {
    return {
      Nodes: [
        {
          id: 'a1b2c3d4-e5f6-4a5b-9c8d-7e6f5d4c3b2a',
          type: 'collection',
          position: {
            x: -543.2069337404396,
            y: -456.41590086278086
          },
          data: {
            label: 'Users',
            fields: [
              {
                id: 'u1-id-field',
                name: '_id',
                type: 'ObjectId',
                isPrimary: true,
                required: true
              },
              {
                id: 'u2-name-field',
                name: 'name',
                type: 'String',
                required: true,
                isPrimary: false,
                isUnique: false,
                index: false,
                ref: ''
              },
              {
                id: 'u3-email-field',
                name: 'email',
                type: 'String',
                required: true,
                isPrimary: false,
                isUnique: true,
                index: true,
                ref: ''
              },
              {
                id: 'u4-password-field',
                name: 'password',
                type: 'String',
                required: true,
                isPrimary: false,
                isUnique: false,
                index: false,
                ref: ''
              },
              {
                id: 'u5-phone-field',
                name: 'phoneNumber',
                type: 'String',
                required: false,
                isPrimary: false,
                isUnique: false,
                index: false,
                ref: ''
              },
              {
                id: 'u6-address-field',
                name: 'addresses',
                type: 'Array',
                arrayType: 'Address',
                required: false,
                isPrimary: false,
                isUnique: false,
                index: false,
                ref: ''
              }
            ]
          }
        },
        {
          id: 'b2c3d4e5-f6a5-5b9c-8d7e-6f5d4c3b2a1',
          type: 'collection',
          position: {
            x: 192.3542501837161,
            y: 85.29865151540696
          },
          data: {
            label: 'Products',
            fields: [
              {
                id: 'p1-id-field',
                name: '_id',
                type: 'ObjectId',
                isPrimary: true,
                required: true
              },
              {
                id: 'p2-name-field',
                name: 'name',
                type: 'String',
                required: true,
                isPrimary: false,
                isUnique: false,
                index: true,
                ref: ''
              },
              {
                id: 'p3-price-field',
                name: 'price',
                type: 'Number',
                required: true,
                isPrimary: false,
                isUnique: false,
                index: false,
                ref: ''
              },
              {
                id: 'p4-description-field',
                name: 'description',
                type: 'String',
                required: false,
                isPrimary: false,
                isUnique: false,
                index: false,
                ref: ''
              },
              {
                id: 'p5-stock-field',
                name: 'stockQuantity',
                type: 'Number',
                required: true,
                isPrimary: false,
                isUnique: false,
                index: false,
                ref: ''
              },
              {
                id: 'p6-category-field',
                name: 'categoryId',
                type: 'ObjectId',
                required: true,
                isPrimary: false,
                isUnique: false,
                index: true,
                ref: ''
              },
              {
                id: 'p7-images-field',
                name: 'images',
                type: 'Array',
                arrayType: 'String',
                required: false,
                isPrimary: false,
                isUnique: false,
                index: false,
                ref: ''
              }
            ]
          }
        },
        {
          id: 'c3d4e5f6-a5b9-c8d7-e6f5-d4c3b2a1b2',
          type: 'collection',
          position: {
            x: 439.15406803383706,
            y: 171.28949597805013
          },
          data: {
            label: 'Categories',
            fields: [
              {
                id: 'c1-id-field',
                name: '_id',
                type: 'ObjectId',
                isPrimary: true,
                required: true
              },
              {
                id: 'c2-name-field',
                name: 'name',
                type: 'String',
                required: true,
                isPrimary: false,
                isUnique: true,
                index: true,
                ref: ''
              },
              {
                id: 'c3-description-field',
                name: 'description',
                type: 'String',
                required: false,
                isPrimary: false,
                isUnique: false,
                index: false,
                ref: ''
              },
              {
                id: 'c4-parent-field',
                name: 'parentCategoryId',
                type: 'ObjectId',
                required: false,
                isPrimary: false,
                isUnique: false,
                index: true,
                ref: ''
              }
            ]
          }
        },
        {
          id: 'd4e5f6a5-b9c8-d7e6-f5d4-c3b2a1b2c3',
          type: 'collection',
          position: {
            x: -466.83906413706177,
            y: -23.116531179767506
          },
          data: {
            label: 'Orders',
            fields: [
              {
                id: 'o1-id-field',
                name: '_id',
                type: 'ObjectId',
                isPrimary: true,
                required: true
              },
              {
                id: 'o2-orderid-field',
                name: 'orderNumber',
                type: 'String',
                required: true,
                isPrimary: false,
                isUnique: true,
                index: true,
                ref: ''
              },
              {
                id: 'o3-user-field',
                name: 'userId',
                type: 'ObjectId',
                required: true,
                isPrimary: false,
                isUnique: false,
                index: true,
                ref: ''
              },
              {
                id: 'o4-status-field',
                name: 'status',
                type: 'String',
                required: true,
                isPrimary: false,
                isUnique: false,
                index: true,
                ref: ''
              },
              {
                id: 'o5-date-field',
                name: 'orderDate',
                type: 'Date',
                required: true,
                isPrimary: false,
                isUnique: false,
                index: true,
                ref: ''
              },
              {
                id: 'o6-total-field',
                name: 'totalAmount',
                type: 'Number',
                required: true,
                isPrimary: false,
                isUnique: false,
                index: false,
                ref: ''
              },
              {
                id: 'o7-shipping-field',
                name: 'shippingAddress',
                type: 'Object',
                required: true,
                isPrimary: false,
                isUnique: false,
                index: false,
                ref: ''
              },
              {
                id: 'o8-payment-field',
                name: 'paymentMethod',
                type: 'String',
                required: true,
                isPrimary: false,
                isUnique: false,
                index: false,
                ref: ''
              }
            ]
          }
        },
        {
          id: 'e5f6a5b9-c8d7-e6f5-d4c3-b2a1b2c3d4',
          type: 'collection',
          position: {
            x: -210.91379310450208,
            y: 65.31344649600928
          },
          data: {
            label: 'OrderItems',
            fields: [
              {
                id: 'oi1-id-field',
                name: '_id',
                type: 'ObjectId',
                isPrimary: true,
                required: true
              },
              {
                id: 'oi2-order-field',
                name: 'orderId',
                type: 'ObjectId',
                required: true,
                isPrimary: false,
                isUnique: false,
                index: true,
                ref: ''
              },
              {
                id: 'oi3-product-field',
                name: 'productId',
                type: 'ObjectId',
                required: true,
                isPrimary: false,
                isUnique: false,
                index: true,
                ref: ''
              },
              {
                id: 'oi4-quantity-field',
                name: 'quantity',
                type: 'Number',
                required: true,
                isPrimary: false,
                isUnique: false,
                index: false,
                ref: ''
              },
              {
                id: 'oi5-price-field',
                name: 'priceAtPurchase',
                type: 'Number',
                required: true,
                isPrimary: false,
                isUnique: false,
                index: false,
                ref: ''
              }
            ]
          }
        },
        {
          id: 'f6a5b9c8-d7e6-f5d4-c3b2-a1b2c3d4e5',
          type: 'collection',
          position: {
            x: -94.1344970833022,
            y: 532.1743537537398
          },
          data: {
            label: 'Carts',
            fields: [
              {
                id: 'cart1-id-field',
                name: '_id',
                type: 'ObjectId',
                isPrimary: true,
                required: true
              },
              {
                id: 'cart2-user-field',
                name: 'userId',
                type: 'ObjectId',
                required: true,
                isPrimary: false,
                isUnique: true,
                index: true,
                ref: ''
              },
              {
                id: 'cart3-items-field',
                name: 'items',
                type: 'Array',
                arrayType: 'CartItem',
                required: false,
                isPrimary: false,
                isUnique: false,
                index: false,
                ref: ''
              },
              {
                id: 'cart4-date-field',
                name: 'updatedAt',
                type: 'Date',
                required: true,
                isPrimary: false,
                isUnique: false,
                index: false,
                ref: ''
              }
            ]
          }
        },
        {
          id: 'a5b9c8d7-e6f5-d4c3-b2a1-b2c3d4e5f6',
          type: 'collection',
          position: {
            x: 178.62353518366058,
            y: 604.6537197189969
          },
          data: {
            label: 'CartItem',
            fields: [
              {
                id: 'ci1-product-field',
                name: 'productId',
                type: 'ObjectId',
                required: true,
                isPrimary: false,
                isUnique: false,
                index: true,
                ref: ''
              },
              {
                id: 'ci2-quantity-field',
                name: 'quantity',
                type: 'Number',
                required: true,
                isPrimary: false,
                isUnique: false,
                index: false,
                ref: ''
              }
            ]
          }
        },
        {
          id: 'b9c8d7e6-f5d4-c3b2-a1b2-c3d4e5f6a5',
          type: 'collection',
          position: {
            x: -799.6860393384788,
            y: -446.65902191657585
          },
          data: {
            label: 'Address',
            fields: [
              {
                id: 'addr1-street-field',
                name: 'street',
                type: 'String',
                required: true,
                isPrimary: false,
                isUnique: false,
                index: false,
                ref: ''
              },
              {
                id: 'addr2-city-field',
                name: 'city',
                type: 'String',
                required: true,
                isPrimary: false,
                isUnique: false,
                index: false,
                ref: ''
              },
              {
                id: 'addr3-state-field',
                name: 'state',
                type: 'String',
                required: true,
                isPrimary: false,
                isUnique: false,
                index: false,
                ref: ''
              },
              {
                id: 'addr4-country-field',
                name: 'country',
                type: 'String',
                required: true,
                isPrimary: false,
                isUnique: false,
                index: false,
                ref: ''
              },
              {
                id: 'addr5-zip-field',
                name: 'zipCode',
                type: 'String',
                required: true,
                isPrimary: false,
                isUnique: false,
                index: false,
                ref: ''
              },
              {
                id: 'addr6-default-field',
                name: 'isDefault',
                type: 'Boolean',
                required: true,
                isPrimary: false,
                isUnique: false,
                index: false,
                ref: ''
              }
            ]
          }
        },
        {
          id: 'c8d7e6f5-d4c3-b2a1-b2c3-d4e5f6a5b9',
          type: 'collection',
          position: {
            x: 299.6521622781107,
            y: -358.9870133343471
          },
          data: {
            label: 'Reviews',
            fields: [
              {
                id: 'r1-id-field',
                name: '_id',
                type: 'ObjectId',
                isPrimary: true,
                required: true
              },
              {
                id: 'r2-product-field',
                name: 'productId',
                type: 'ObjectId',
                required: true,
                isPrimary: false,
                isUnique: false,
                index: true,
                ref: ''
              },
              {
                id: 'r3-user-field',
                name: 'userId',
                type: 'ObjectId',
                required: true,
                isPrimary: false,
                isUnique: false,
                index: true,
                ref: ''
              },
              {
                id: 'r4-rating-field',
                name: 'rating',
                type: 'Number',
                required: true,
                isPrimary: false,
                isUnique: false,
                index: false,
                ref: ''
              },
              {
                id: 'r5-comment-field',
                name: 'comment',
                type: 'String',
                required: false,
                isPrimary: false,
                isUnique: false,
                index: false,
                ref: ''
              },
              {
                id: 'r6-date-field',
                name: 'createdAt',
                type: 'Date',
                required: true,
                isPrimary: false,
                isUnique: false,
                index: true,
                ref: ''
              }
            ]
          }
        }
      ],
      Edges: [
        {
          source: 'b2c3d4e5-f6a5-5b9c-8d7e-6f5d4c3b2a1',
          sourceHandle: 'categoryId-source',
          target: 'c3d4e5f6-a5b9-c8d7-e6f5-d4c3b2a1b2',
          targetHandle: null,
          id: 'edge1-product-category',
          animated: true,
          type: 'step',
          label: 'belongs to',
          markerEnd: {
            type: 'arrowclosed'
          },
          style: {
            stroke: '#155dfc',
            strokeWidth: 1
          }
        },
        {
          source: 'c3d4e5f6-a5b9-c8d7-e6f5-d4c3b2a1b2',
          sourceHandle: 'parentCategoryId-source',
          target: 'c3d4e5f6-a5b9-c8d7-e6f5-d4c3b2a1b2',
          targetHandle: null,
          id: 'edge2-category-parent',
          animated: true,
          type: 'step',
          label: 'parent of',
          markerEnd: {
            type: 'arrowclosed'
          },
          style: {
            stroke: '#155dfc',
            strokeWidth: 1
          }
        },
        {
          source: 'd4e5f6a5-b9c8-d7e6-f5d4-c3b2a1b2c3',
          sourceHandle: 'userId-source',
          target: 'a1b2c3d4-e5f6-4a5b-9c8d-7e6f5d4c3b2a',
          targetHandle: null,
          id: 'edge3-order-user',
          animated: true,
          type: 'step',
          label: 'placed by',
          markerEnd: {
            type: 'arrowclosed'
          },
          style: {
            stroke: '#155dfc',
            strokeWidth: 1
          }
        },
        {
          source: 'e5f6a5b9-c8d7-e6f5-d4c3-b2a1b2c3d4',
          sourceHandle: 'orderId-source',
          target: 'd4e5f6a5-b9c8-d7e6-f5d4-c3b2a1b2c3',
          targetHandle: null,
          id: 'edge4-orderitem-order',
          animated: true,
          type: 'step',
          label: 'belongs to',
          markerEnd: {
            type: 'arrowclosed'
          },
          style: {
            stroke: '#155dfc',
            strokeWidth: 1
          }
        },
        {
          source: 'e5f6a5b9-c8d7-e6f5-d4c3-b2a1b2c3d4',
          sourceHandle: 'productId-source',
          target: 'b2c3d4e5-f6a5-5b9c-8d7e-6f5d4c3b2a1',
          targetHandle: null,
          id: 'edge5-orderitem-product',
          animated: true,
          type: 'step',
          label: 'references',
          markerEnd: {
            type: 'arrowclosed'
          },
          style: {
            stroke: '#155dfc',
            strokeWidth: 1
          }
        },
        {
          source: 'f6a5b9c8-d7e6-f5d4-c3b2-a1b2c3d4e5',
          sourceHandle: 'userId-source',
          target: 'a1b2c3d4-e5f6-4a5b-9c8d-7e6f5d4c3b2a',
          targetHandle: null,
          id: 'edge6-cart-user',
          animated: true,
          type: 'step',
          label: 'belongs to',
          markerEnd: {
            type: 'arrowclosed'
          },
          style: {
            stroke: '#155dfc',
            strokeWidth: 1
          }
        },
        {
          source: 'f6a5b9c8-d7e6-f5d4-c3b2-a1b2c3d4e5',
          sourceHandle: 'items-source',
          target: 'a5b9c8d7-e6f5-d4c3-b2a1-b2c3d4e5f6',
          targetHandle: null,
          id: 'edge7-cart-cartitems',
          animated: true,
          type: 'step',
          label: 'contains many',
          markerEnd: {
            type: 'arrowclosed'
          },
          style: {
            stroke: '#155dfc',
            strokeWidth: 1
          }
        },
        {
          source: 'c8d7e6f5-d4c3-b2a1-b2c3-d4e5f6a5b9',
          sourceHandle: 'productId-source',
          target: 'b2c3d4e5-f6a5-5b9c-8d7e-6f5d4c3b2a1',
          targetHandle: null,
          id: 'edge9-review-product',
          animated: true,
          type: 'step',
          label: 'for',
          markerEnd: {
            type: 'arrowclosed'
          },
          style: {
            stroke: '#155dfc',
            strokeWidth: 1
          }
        },
        {
          source: 'c8d7e6f5-d4c3-b2a1-b2c3-d4e5f6a5b9',
          sourceHandle: 'userId-source',
          target: 'a1b2c3d4-e5f6-4a5b-9c8d-7e6f5d4c3b2a',
          targetHandle: null,
          id: 'edge10-review-user',
          animated: true,
          type: 'step',
          label: 'written by',
          markerEnd: {
            type: 'arrowclosed'
          },
          style: {
            stroke: '#155dfc',
            strokeWidth: 1
          }
        },
        {
          source: 'a1b2c3d4-e5f6-4a5b-9c8d-7e6f5d4c3b2a',
          sourceHandle: 'addresses-source',
          target: 'b9c8d7e6-f5d4-c3b2-a1b2-c3d4e5f6a5',
          targetHandle: null,
          id: 'edge11-user-address',
          animated: true,
          type: 'step',
          label: 'has many',
          markerEnd: {
            type: 'arrowclosed'
          },
          style: {
            stroke: '#155dfc',
            strokeWidth: 1
          }
        },
        {
          source: 'a5b9c8d7-e6f5-d4c3-b2a1-b2c3d4e5f6',
          sourceHandle: 'productId-source',
          target: 'b2c3d4e5-f6a5-5b9c-8d7e-6f5d4c3b2a1',
          targetHandle: null,
          id: 'bc7943b1-d543-4212-b1e6-70bd3b884fde',
          animated: true,
          type: 'step',
          label: '',
          markerEnd: {
            type: 'arrowclosed'
          },
          style: {
            stroke: '#155dfc',
            strokeWidth: 1
          }
        }
      ]
    };
  }

  /**
   * Get CRM template with contacts, leads, and deals
   */
  private getCrmTemplate(): Record<string, unknown> {
    return {
      Nodes: [
        {
          id: 'user-table',
          type: 'table',
          position: { x: 100, y: 100 },
          data: {
            name: 'users',
            columns: [
              { name: 'id', type: 'uuid', primaryKey: true },
              {
                name: 'username',
                type: 'varchar',
                length: 50,
                notNull: true,
                unique: true
              },
              {
                name: 'email',
                type: 'varchar',
                length: 100,
                notNull: true,
                unique: true
              },
              { name: 'password', type: 'varchar', length: 100, notNull: true },
              { name: 'first_name', type: 'varchar', length: 50 },
              { name: 'last_name', type: 'varchar', length: 50 },
              {
                name: 'role',
                type: 'varchar',
                length: 20,
                defaultValue: 'agent'
              },
              {
                name: 'created_at',
                type: 'timestamp',
                defaultValue: 'CURRENT_TIMESTAMP'
              }
            ]
          }
        },
        {
          id: 'contact-table',
          type: 'table',
          position: { x: 400, y: 100 },
          data: {
            name: 'contacts',
            columns: [
              { name: 'id', type: 'uuid', primaryKey: true },
              {
                name: 'first_name',
                type: 'varchar',
                length: 50,
                notNull: true
              },
              { name: 'last_name', type: 'varchar', length: 50, notNull: true },
              { name: 'email', type: 'varchar', length: 100 },
              { name: 'phone', type: 'varchar', length: 20 },
              { name: 'company', type: 'varchar', length: 100 },
              { name: 'assigned_to', type: 'uuid', foreignKey: true },
              {
                name: 'created_at',
                type: 'timestamp',
                defaultValue: 'CURRENT_TIMESTAMP'
              },
              {
                name: 'updated_at',
                type: 'timestamp',
                defaultValue: 'CURRENT_TIMESTAMP'
              }
            ]
          }
        },
        {
          id: 'lead-table',
          type: 'table',
          position: { x: 100, y: 400 },
          data: {
            name: 'leads',
            columns: [
              { name: 'id', type: 'uuid', primaryKey: true },
              {
                name: 'contact_id',
                type: 'uuid',
                notNull: true,
                foreignKey: true
              },
              { name: 'status', type: 'varchar', length: 20, notNull: true },
              { name: 'source', type: 'varchar', length: 50 },
              {
                name: 'estimated_value',
                type: 'decimal',
                precision: 10,
                scale: 2
              },
              { name: 'assigned_to', type: 'uuid', foreignKey: true },
              {
                name: 'created_at',
                type: 'timestamp',
                defaultValue: 'CURRENT_TIMESTAMP'
              },
              {
                name: 'updated_at',
                type: 'timestamp',
                defaultValue: 'CURRENT_TIMESTAMP'
              }
            ]
          }
        },
        {
          id: 'deal-table',
          type: 'table',
          position: { x: 400, y: 400 },
          data: {
            name: 'deals',
            columns: [
              { name: 'id', type: 'uuid', primaryKey: true },
              {
                name: 'lead_id',
                type: 'uuid',
                notNull: true,
                foreignKey: true
              },
              { name: 'name', type: 'varchar', length: 100, notNull: true },
              { name: 'stage', type: 'varchar', length: 20, notNull: true },
              {
                name: 'amount',
                type: 'decimal',
                precision: 10,
                scale: 2,
                notNull: true
              },
              { name: 'close_date', type: 'date' },
              { name: 'probability', type: 'integer' },
              { name: 'assigned_to', type: 'uuid', foreignKey: true },
              {
                name: 'created_at',
                type: 'timestamp',
                defaultValue: 'CURRENT_TIMESTAMP'
              },
              {
                name: 'updated_at',
                type: 'timestamp',
                defaultValue: 'CURRENT_TIMESTAMP'
              }
            ]
          }
        }
      ],
      Edges: [
        {
          id: 'user-contact-edge',
          source: 'user-table',
          target: 'contact-table',
          sourceHandle: 'id',
          targetHandle: 'assigned_to'
        },
        {
          id: 'contact-lead-edge',
          source: 'contact-table',
          target: 'lead-table',
          sourceHandle: 'id',
          targetHandle: 'contact_id'
        },
        {
          id: 'user-lead-edge',
          source: 'user-table',
          target: 'lead-table',
          sourceHandle: 'id',
          targetHandle: 'assigned_to'
        },
        {
          id: 'lead-deal-edge',
          source: 'lead-table',
          target: 'deal-table',
          sourceHandle: 'id',
          targetHandle: 'lead_id'
        },
        {
          id: 'user-deal-edge',
          source: 'user-table',
          target: 'deal-table',
          sourceHandle: 'id',
          targetHandle: 'assigned_to'
        }
      ]
    };
  }

  /**
   * Get social network template with users, posts, comments, and connections
   */
  private getSocialNetworkTemplate(): Record<string, unknown> {
    return {
      Nodes: [
        {
          id: 'user-table',
          type: 'table',
          position: { x: 100, y: 100 },
          data: {
            name: 'users',
            columns: [
              { name: 'id', type: 'uuid', primaryKey: true },
              {
                name: 'username',
                type: 'varchar',
                length: 50,
                notNull: true,
                unique: true
              },
              {
                name: 'email',
                type: 'varchar',
                length: 100,
                notNull: true,
                unique: true
              },
              { name: 'password', type: 'varchar', length: 100, notNull: true },
              { name: 'display_name', type: 'varchar', length: 100 },
              { name: 'bio', type: 'text' },
              { name: 'profile_image', type: 'varchar', length: 255 },
              {
                name: 'created_at',
                type: 'timestamp',
                defaultValue: 'CURRENT_TIMESTAMP'
              },
              {
                name: 'updated_at',
                type: 'timestamp',
                defaultValue: 'CURRENT_TIMESTAMP'
              }
            ]
          }
        },
        {
          id: 'post-table',
          type: 'table',
          position: { x: 400, y: 100 },
          data: {
            name: 'posts',
            columns: [
              { name: 'id', type: 'uuid', primaryKey: true },
              {
                name: 'user_id',
                type: 'uuid',
                notNull: true,
                foreignKey: true
              },
              { name: 'content', type: 'text', notNull: true },
              { name: 'image_url', type: 'varchar', length: 255 },
              { name: 'likes_count', type: 'integer', defaultValue: 0 },
              { name: 'comments_count', type: 'integer', defaultValue: 0 },
              {
                name: 'created_at',
                type: 'timestamp',
                defaultValue: 'CURRENT_TIMESTAMP'
              },
              {
                name: 'updated_at',
                type: 'timestamp',
                defaultValue: 'CURRENT_TIMESTAMP'
              }
            ]
          }
        },
        {
          id: 'comment-table',
          type: 'table',
          position: { x: 700, y: 100 },
          data: {
            name: 'comments',
            columns: [
              { name: 'id', type: 'uuid', primaryKey: true },
              {
                name: 'user_id',
                type: 'uuid',
                notNull: true,
                foreignKey: true
              },
              {
                name: 'post_id',
                type: 'uuid',
                notNull: true,
                foreignKey: true
              },
              { name: 'content', type: 'text', notNull: true },
              {
                name: 'created_at',
                type: 'timestamp',
                defaultValue: 'CURRENT_TIMESTAMP'
              },
              {
                name: 'updated_at',
                type: 'timestamp',
                defaultValue: 'CURRENT_TIMESTAMP'
              }
            ]
          }
        },
        {
          id: 'friendship-table',
          type: 'table',
          position: { x: 100, y: 400 },
          data: {
            name: 'friendships',
            columns: [
              { name: 'id', type: 'uuid', primaryKey: true },
              {
                name: 'user_id',
                type: 'uuid',
                notNull: true,
                foreignKey: true
              },
              {
                name: 'friend_id',
                type: 'uuid',
                notNull: true,
                foreignKey: true
              },
              { name: 'status', type: 'varchar', length: 20, notNull: true },
              {
                name: 'created_at',
                type: 'timestamp',
                defaultValue: 'CURRENT_TIMESTAMP'
              },
              {
                name: 'updated_at',
                type: 'timestamp',
                defaultValue: 'CURRENT_TIMESTAMP'
              }
            ]
          }
        },
        {
          id: 'like-table',
          type: 'table',
          position: { x: 400, y: 400 },
          data: {
            name: 'likes',
            columns: [
              { name: 'id', type: 'uuid', primaryKey: true },
              {
                name: 'user_id',
                type: 'uuid',
                notNull: true,
                foreignKey: true
              },
              {
                name: 'post_id',
                type: 'uuid',
                notNull: true,
                foreignKey: true
              },
              {
                name: 'created_at',
                type: 'timestamp',
                defaultValue: 'CURRENT_TIMESTAMP'
              }
            ]
          }
        }
      ],
      Edges: [
        {
          id: 'user-post-edge',
          source: 'user-table',
          target: 'post-table',
          sourceHandle: 'id',
          targetHandle: 'user_id'
        },
        {
          id: 'user-comment-edge',
          source: 'user-table',
          target: 'comment-table',
          sourceHandle: 'id',
          targetHandle: 'user_id'
        },
        {
          id: 'post-comment-edge',
          source: 'post-table',
          target: 'comment-table',
          sourceHandle: 'id',
          targetHandle: 'post_id'
        },
        {
          id: 'user-friendship1-edge',
          source: 'user-table',
          target: 'friendship-table',
          sourceHandle: 'id',
          targetHandle: 'user_id'
        },
        {
          id: 'user-friendship2-edge',
          source: 'user-table',
          target: 'friendship-table',
          sourceHandle: 'id',
          targetHandle: 'friend_id'
        },
        {
          id: 'user-like-edge',
          source: 'user-table',
          target: 'like-table',
          sourceHandle: 'id',
          targetHandle: 'user_id'
        },
        {
          id: 'post-like-edge',
          source: 'post-table',
          target: 'like-table',
          sourceHandle: 'id',
          targetHandle: 'post_id'
        }
      ]
    };
  }

  /**
   * Get task manager template with projects, tasks, and user assignments
   */
  private getTaskManagerTemplate(): Record<string, unknown> {
    return {
      Nodes: [
        {
          id: 'user-table',
          type: 'table',
          position: { x: 100, y: 100 },
          data: {
            name: 'users',
            columns: [
              { name: 'id', type: 'uuid', primaryKey: true },
              {
                name: 'username',
                type: 'varchar',
                length: 50,
                notNull: true,
                unique: true
              },
              {
                name: 'email',
                type: 'varchar',
                length: 100,
                notNull: true,
                unique: true
              },
              { name: 'password', type: 'varchar', length: 100, notNull: true },
              { name: 'first_name', type: 'varchar', length: 50 },
              { name: 'last_name', type: 'varchar', length: 50 },
              {
                name: 'created_at',
                type: 'timestamp',
                defaultValue: 'CURRENT_TIMESTAMP'
              }
            ]
          }
        },
        {
          id: 'project-table',
          type: 'table',
          position: { x: 400, y: 100 },
          data: {
            name: 'projects',
            columns: [
              { name: 'id', type: 'uuid', primaryKey: true },
              { name: 'name', type: 'varchar', length: 100, notNull: true },
              { name: 'description', type: 'text' },
              {
                name: 'owner_id',
                type: 'uuid',
                notNull: true,
                foreignKey: true
              },
              { name: 'status', type: 'varchar', length: 20, notNull: true },
              { name: 'start_date', type: 'date' },
              { name: 'due_date', type: 'date' },
              {
                name: 'created_at',
                type: 'timestamp',
                defaultValue: 'CURRENT_TIMESTAMP'
              },
              {
                name: 'updated_at',
                type: 'timestamp',
                defaultValue: 'CURRENT_TIMESTAMP'
              }
            ]
          }
        },
        {
          id: 'task-table',
          type: 'table',
          position: { x: 700, y: 100 },
          data: {
            name: 'tasks',
            columns: [
              { name: 'id', type: 'uuid', primaryKey: true },
              { name: 'title', type: 'varchar', length: 100, notNull: true },
              { name: 'description', type: 'text' },
              {
                name: 'project_id',
                type: 'uuid',
                notNull: true,
                foreignKey: true
              },
              { name: 'assigned_to', type: 'uuid', foreignKey: true },
              { name: 'status', type: 'varchar', length: 20, notNull: true },
              { name: 'priority', type: 'varchar', length: 20 },
              { name: 'due_date', type: 'date' },
              {
                name: 'created_at',
                type: 'timestamp',
                defaultValue: 'CURRENT_TIMESTAMP'
              },
              {
                name: 'updated_at',
                type: 'timestamp',
                defaultValue: 'CURRENT_TIMESTAMP'
              }
            ]
          }
        },
        {
          id: 'project-member-table',
          type: 'table',
          position: { x: 100, y: 400 },
          data: {
            name: 'project_members',
            columns: [
              { name: 'id', type: 'uuid', primaryKey: true },
              {
                name: 'project_id',
                type: 'uuid',
                notNull: true,
                foreignKey: true
              },
              {
                name: 'user_id',
                type: 'uuid',
                notNull: true,
                foreignKey: true
              },
              { name: 'role', type: 'varchar', length: 20, notNull: true },
              {
                name: 'created_at',
                type: 'timestamp',
                defaultValue: 'CURRENT_TIMESTAMP'
              }
            ]
          }
        },
        {
          id: 'task-comment-table',
          type: 'table',
          position: { x: 400, y: 400 },
          data: {
            name: 'task_comments',
            columns: [
              { name: 'id', type: 'uuid', primaryKey: true },
              {
                name: 'task_id',
                type: 'uuid',
                notNull: true,
                foreignKey: true
              },
              {
                name: 'user_id',
                type: 'uuid',
                notNull: true,
                foreignKey: true
              },
              { name: 'content', type: 'text', notNull: true },
              {
                name: 'created_at',
                type: 'timestamp',
                defaultValue: 'CURRENT_TIMESTAMP'
              }
            ]
          }
        }
      ],
      Edges: [
        {
          id: 'user-project-edge',
          source: 'user-table',
          target: 'project-table',
          sourceHandle: 'id',
          targetHandle: 'owner_id'
        },
        {
          id: 'user-task-edge',
          source: 'user-table',
          target: 'task-table',
          sourceHandle: 'id',
          targetHandle: 'assigned_to'
        },
        {
          id: 'project-task-edge',
          source: 'project-table',
          target: 'task-table',
          sourceHandle: 'id',
          targetHandle: 'project_id'
        },
        {
          id: 'project-projectmember-edge',
          source: 'project-table',
          target: 'project-member-table',
          sourceHandle: 'id',
          targetHandle: 'project_id'
        },
        {
          id: 'user-projectmember-edge',
          source: 'user-table',
          target: 'project-member-table',
          sourceHandle: 'id',
          targetHandle: 'user_id'
        },
        {
          id: 'task-comment-edge',
          source: 'task-table',
          target: 'task-comment-table',
          sourceHandle: 'id',
          targetHandle: 'task_id'
        },
        {
          id: 'user-comment-edge',
          source: 'user-table',
          target: 'task-comment-table',
          sourceHandle: 'id',
          targetHandle: 'user_id'
        }
      ]
    };
  }
}
