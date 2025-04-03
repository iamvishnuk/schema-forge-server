import { InvitationRoleEnum } from '../core/entities/Invitation.entity';
import { UserEntity } from '../core/entities/user.entity';

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
