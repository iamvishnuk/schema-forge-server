import { InvitationRoleEnum } from '../core/entities/Invitation.entity';
import { UserEntity } from '../core/entities/user.entity';

export interface IInviteTeamMember {
  teamId: string;
  user: UserEntity;
  inviteeEmail: string;
  role: InvitationRoleEnum;
}
