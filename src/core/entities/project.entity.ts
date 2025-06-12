import mongoose from 'mongoose';

export enum ProjectDataBaseTypeEnum {
  MYSQL = 'mysql',
  POSTGRESQL = 'postgresql',
  MONGODB = 'mongodb',
  SQLITE = 'sqlite'
}

export enum ProjectTemplateEnum {
  NONE = 'none',
  BLOG = 'blog',
  ECOMMERCE = 'ecommerce',
  CRM = 'crm',
  SOCIAL_NETWORK = 'social_network',
  TASK_MANAGER = 'task_manager'
}

export interface ProjectEntity {
  _id: string | unknown;
  name: string;
  description: string;
  databaseType: ProjectDataBaseTypeEnum;
  tag: string[];
  connectionString: string;
  createdBy: mongoose.Types.ObjectId;
  inviteToken: string;
  templateType?: ProjectTemplateEnum;
  createdAt: Date;
  updatedAt: Date;
}
