import mongoose, { Document, Schema } from 'mongoose';
import { VerificationCodeEntity } from '../../core/entities/verificationCode.entity';
import { generateUniqueCode } from '../../utils/uuid';

export interface VerificationCodeDocument
  extends Omit<VerificationCodeEntity, '_id'>,
    Document {}

const VerificationCodeSchema = new Schema<VerificationCodeDocument>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true,
    required: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    default: generateUniqueCode
  },
  type: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now()
  },
  expiresAt: {
    type: Date,
    required: true
  }
});

export const VerificationCodeModel = mongoose.model<VerificationCodeDocument>(
  'VerificationCode',
  VerificationCodeSchema,
  'verification_codes'
);
