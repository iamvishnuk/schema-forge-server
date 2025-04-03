import mongoose, { Document, Schema } from 'mongoose';
import { TeamEntity } from '../../core/entities/teams.entity';

export interface TeamDocument
  extends Omit<TeamEntity, 'save' | '_id'>,
    Document {}

const TeamSchema = new Schema<TeamDocument>(
  {
    name: { type: String, required: true },
    description: { type: String },
    createdBy: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
      index: true
    }
  },
  { timestamps: true, versionKey: false }
);

export const TeamModel = mongoose.model<TeamDocument>('Team', TeamSchema);
