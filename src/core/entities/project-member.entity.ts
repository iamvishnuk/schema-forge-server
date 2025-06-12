import mongoose from 'mongoose';

export enum ProjectMemberRoleEnum {
  OWNER = 'owner',
  EDITOR = 'editor',
  VIEWER = 'viewer'
}

export interface ProjectMemberEntity {
  _id: string | unknown;
  userId: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  role: ProjectMemberRoleEnum;
  joinedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
