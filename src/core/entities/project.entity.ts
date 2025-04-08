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
  teamIds: mongoose.Types.ObjectId[];
  databaseType: ProjectDataBaseTypeEnum;
  tag: string[];
  connectionString: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
