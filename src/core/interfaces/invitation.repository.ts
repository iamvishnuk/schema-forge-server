import { InvitationEntity } from '../entities/Invitation.entity';

export interface InvitationRepository {
  createInvitation(
    data: Omit<InvitationEntity, '_id' | 'createdAt' | 'updatedAt' | 'token'>
  ): Promise<InvitationEntity>;
  countInvitations(
    data: Pick<InvitationEntity, 'inviteeEmail' | 'teamId'>,
    createdAtQuery?: { $gt: Date; $lt?: Date }
  ): Promise<number>;
}
