import mongoose, { Document, Schema } from 'mongoose';
import {
  ProjectDataBaseTypeEnum,
  ProjectEntity
} from '../../core/entities/project.entity';
import { generateUniqueCode } from '../../utils/uuid';

export interface ProductDocument extends Omit<ProjectEntity, '_id'>, Document {}

const ProjectSchema = new Schema<ProductDocument>(
  {
    name: { type: String, required: true },
    description: { type: String },
    databaseType: {
      type: String,
      enum: ProjectDataBaseTypeEnum,
      required: true
    },
    tag: [{ type: String }],
    connectionString: { type: String },
    createdBy: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
      index: true
    },
    inviteToken: {
      type: String,
      required: true,
      unique: true,
      default: generateUniqueCode
    }
  },
  { timestamps: true, versionKey: false }
);

export const ProjectModel = mongoose.model<ProductDocument>(
  'Project',
  ProjectSchema
);
