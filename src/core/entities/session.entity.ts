import mongoose from 'mongoose';

export interface SessionEntity {
  _id: string | unknown;
  userId: mongoose.Types.ObjectId;
  userAgent: string;
  expiredAt: Date;
  createdAt: Date;
  save: () => Promise<SessionEntity>;
  toObject: () => SessionEntity;
}
