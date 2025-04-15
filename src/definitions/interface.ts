import { InvitationRoleEnum } from '../core/entities/Invitation.entity';
import { UserEntity } from '../core/entities/user.entity';
import { TField, XYPosition } from './type';

export interface IInviteTeamMember {
  teamId: string;
  user: UserEntity;
  inviteeEmail: string;
  role: InvitationRoleEnum;
}

export interface IGetUserTeams {
  _id: string;
  name: string;
  description: string;
  memberCount: number;
  createdAt: Date;
  createdBy: string;
}

export interface INode {
  id: string;
  type: string;
  position: XYPosition;
  data: {
    label: string;
    description: string;
    fields: TField[];
  };
}
