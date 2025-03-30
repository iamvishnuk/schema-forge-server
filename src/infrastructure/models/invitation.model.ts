import mongoose, { Document, Schema } from 'mongoose';
import {
  InvitationEntity,
  InvitationRoleEnum
} from '../../core/entities/Invitation.entity';
import { generateUniqueCode } from '../../utils/uuid';

export interface InvitationDocument
  extends Omit<InvitationEntity, '_id'>,
    Document {}

const InvitationSchema = new Schema<InvitationDocument>(
  {
    teamId: {
      type: Schema.Types.ObjectId,
      ref: 'Team',
      required: true,
      index: true
    },
    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    inviteeEmail: { type: String, required: true },
    token: { type: String, required: true, default: generateUniqueCode },
    role: {
      type: String,
      enum: InvitationRoleEnum
    },
    expiresAt: { type: Date, required: true }
  },
  { timestamps: true, versionKey: false }
);

export const InvitationModel = mongoose.model<InvitationDocument>(
  'Invitation',
  InvitationSchema
);
