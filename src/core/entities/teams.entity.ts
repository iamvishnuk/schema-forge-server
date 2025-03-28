import mongoose from 'mongoose';
import { UserEntity } from './user.entity';

export interface TeamEntity {
  _id: string | unknown;
  name: string;
  description: string;
  createdBy: mongoose.Types.ObjectId;
  projects: mongoose.Types.ObjectId[];
  members: ITeamMember[];
  createdAt: Date;
  updatedAt: Date;
  save: () => Promise<TeamEntity>;
}

export interface ITeamMember {
  userId: mongoose.Types.ObjectId;
  role: TeamRoleEnum;
  joinedAt: Date;
  status: MemberStatusEnum;
}

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

export interface ITeamWithDetails
  extends Omit<TeamEntity, 'createdBy' | 'members' | 'save'> {
  createdBy: Partial<UserEntity>;
  members: Array<Omit<ITeamMember, 'userId'> & { userId: Partial<UserEntity> }>;
}
