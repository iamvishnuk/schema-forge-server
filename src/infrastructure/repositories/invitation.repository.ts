import { InvitationEntity } from '../../core/entities/Invitation.entity';
import { InvitationRepository } from '../../core/interfaces/invitation.repository';
import { InvitationModel } from '../models/invitation.model';

export class InvitationRepositoryImpl implements InvitationRepository {
  async createInvitation(
    data: Omit<InvitationEntity, '_id' | 'createdAt' | 'updatedAt' | 'token'>
  ): Promise<InvitationEntity> {
    return InvitationModel.create(data);
  }

  countInvitations(
    data: Pick<InvitationEntity, 'inviteeEmail' | 'teamId'>,
    createdAtQuery?: { $gt: Date; $lt?: Date }
  ): Promise<number> {
    return InvitationModel.countDocuments({
      inviteeEmail: data.inviteeEmail,
      teamId: data.teamId,
      ...(createdAtQuery ? { createdAt: createdAtQuery } : {})
    });
  }
}
