import mongoose from 'mongoose';

export enum ProjectDataBaseTypeEnum {
  MYSQL = 'mysql',
  POSTGRESQL = 'postgresql',
  MONGODB = 'mongodb',
  SQLITE = 'sqlite'
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
  createdAt: Date;
  updatedAt: Date;
}
