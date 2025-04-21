import mongoose, { Document, Schema } from 'mongoose';
import {
  MemberStatusEnum,
  TeamMemberEntity,
  TeamRoleEnum
} from '../../core/entities/team-member.entity';

interface TeamMemberDocument
  extends Omit<TeamMemberEntity, 'save' | '_id'>,
    Document {}

const TeamMemberSchema = new Schema<TeamMemberDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
      index: true
    },
    teamId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Team',
      index: true
    },
    role: { type: String, enum: TeamRoleEnum, default: TeamRoleEnum.EDITOR },
    joinedAt: { type: Date, default: Date.now() },
    status: {
      type: String,
      enum: MemberStatusEnum,
      default: MemberStatusEnum.ACTIVE
    }
  },
  { timestamps: true, versionKey: false }
);

export const TeamMemberModel = mongoose.model<TeamMemberDocument>(
  'TeamMember',
  TeamMemberSchema,
  'team_members'
);
