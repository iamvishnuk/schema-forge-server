import mongoose, { Document, Schema } from 'mongoose';
import {
  ITeamMember,
  MemberStatusEnum,
  TeamEntity,
  TeamRoleEnum
} from '../../core/entities/teams.entity';

export interface TeamDocument
  extends Omit<TeamEntity, 'save' | '_id'>,
    Document {}

const TeamMemberSchema = new Schema<ITeamMember>({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User',
    index: true
  },
  joinedAt: { type: Date, default: Date.now() },
  role: { type: String, enum: TeamRoleEnum, default: TeamRoleEnum.MEMBER },
  status: {
    type: String,
    enum: MemberStatusEnum,
    default: MemberStatusEnum.ACTIVE
  }
});

const TeamSchema = new Schema<TeamDocument>(
  {
    name: { type: String, required: true },
    description: { type: String },
    createdBy: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
      index: true
    },
    members: { type: [TeamMemberSchema], default: [] },
    projects: { type: [Schema.Types.ObjectId], default: [] }
  },
  { timestamps: true, versionKey: false }
);

export const TeamModel = mongoose.model<TeamDocument>('Team', TeamSchema);
