import mongoose, { Document, Schema } from 'mongoose';
import {
  ProjectMemberEntity,
  ProjectMemberRoleEnum
} from '../../core/entities/project-member.entity';

export interface ProjectMemberDocument
  extends Omit<ProjectMemberEntity, '_id'>,
    Document {}

const projectMemberSchema = new Schema<ProjectMemberDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true
    },
    role: {
      type: String,
      required: true,
      enum: ProjectMemberRoleEnum,
      default: ProjectMemberRoleEnum.VIEWER
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true, versionKey: false }
);

export const ProjectMemberModel = mongoose.model<ProjectMemberDocument>(
  'ProjectMember',
  projectMemberSchema,
  'project_members'
);
