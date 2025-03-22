import mongoose from 'mongoose';

export const enum VerificationEnum {
  EMAIL_VERIFICATION = 'EMAIL_VERIFICATION',
  PASSWORD_RESET = 'PASSWORD_RESET'
}

export interface VerificationCodeEntity {
  _id: string | unknown;
  code: string;
  userId: mongoose.Types.ObjectId;
  type: VerificationEnum;
  createdAt: Date;
  expiresAt: Date;
}
