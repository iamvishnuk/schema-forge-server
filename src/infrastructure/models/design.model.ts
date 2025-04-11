import mongoose, { Document, Schema } from 'mongoose';
import { DesignEntity } from '../../core/entities/design.entity';

export interface DesignDocument extends Omit<DesignEntity, '_id'>, Document {}

const DesignSchema = new Schema<DesignDocument>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Project',
      index: true
    },
    filePath: {
      type: String,
      required: true
    },
    contentType: {
      type: String,
      required: true
    }
  },
  { timestamps: true, versionKey: false }
);

export const DesignModel = mongoose.model<DesignDocument>(
  'Design',
  DesignSchema
);
