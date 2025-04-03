import mongoose from 'mongoose';

export enum InvitationRoleEnum {
  ADMIN = 'admin',
  MEMBER = 'member',
  VIEWER = 'viewer'
}

export interface InvitationEntity {
  _id: string | unknown;
  teamId: mongoose.Types.ObjectId;
  invitedBy: mongoose.Types.ObjectId;
  inviteeEmail: string;
  token: string;
  role: InvitationRoleEnum;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
