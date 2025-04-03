import mongoose from 'mongoose';
import { UserEntity } from './user.entity';
import { TeamMemberEntity } from './team-member.entity';

export interface TeamEntity {
  _id: string | unknown;
  name: string;
  description: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  save: () => Promise<TeamEntity>;
}

export interface ITeamWithDetails
  extends Omit<TeamEntity, 'createdBy' | 'members' | 'save'> {
  createdBy: Partial<UserEntity>;
  members: Array<
    Omit<TeamMemberEntity, 'userId'> & { userId: Partial<UserEntity> }
  >;
}

export interface ITeamWithMembers extends Omit<TeamEntity, 'save' | 'members'> {
  members: Array<
    Omit<TeamMemberEntity, 'userId'> & { userId: Partial<UserEntity> }
  >;
}
