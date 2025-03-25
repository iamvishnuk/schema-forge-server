import mongoose, { Schema, Document } from 'mongoose';
import { SessionEntity } from '../../core/entities/session.entity';
import { thirtyDaysFromNow } from '../../utils/date-time';

export interface SessionDocument
  extends Omit<SessionEntity, '_id' | 'save' | 'toObject'>,
    Document {}

const SessionSchema = new Schema<SessionDocument>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  userAgent: { type: String, required: false },
  createdAt: { type: Date, default: Date.now() },
  expiredAt: { type: Date, required: true, default: thirtyDaysFromNow() }
});

export const SessionModel = mongoose.model<SessionDocument>(
  'Session',
  SessionSchema
);
