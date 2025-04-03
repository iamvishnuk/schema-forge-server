import mongoose from 'mongoose';
import { UserEntity } from './user.entity';

export enum TeamRoleEnum {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
  VIEWER = 'viewer'
}

export enum MemberStatusEnum {
  ACTIVE = 'active',
  PENDING = 'pending',
  INVITED = 'invited',
  SUSPENDED = 'suspended'
}

export interface TeamMemberEntity {
  _id: string | unknown;
  userId: mongoose.Types.ObjectId;
  teamId: mongoose.Types.ObjectId;
  role: TeamRoleEnum;
  joinedAt: Date;
  status: MemberStatusEnum;
  createdAt: Date;
  updatedAt: Date;
  save: () => Promise<TeamMemberEntity>;
}

export interface TeamMemberWithUser {
  _id: string | unknown;
  userId: Pick<UserEntity, '_id' | 'name' | 'email'>;
  teamId: mongoose.Types.ObjectId;
  role: TeamRoleEnum;
  joinedAt: Date;
  status: MemberStatusEnum;
  createdAt: Date;
  updatedAt: Date;
}
