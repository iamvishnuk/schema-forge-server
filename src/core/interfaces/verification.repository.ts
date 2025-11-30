import {
  VerificationCodeEntity,
  VerificationEnum
} from '../entities/verificationCode.entity';

export interface VerificationRepository {
  createVerificationCode(
    verification: Pick<VerificationCodeEntity, 'expiresAt' | 'userId' | 'type'>
  ): Promise<VerificationCodeEntity>;
  findUnExpiredVerificationCode(
    verification: Pick<VerificationCodeEntity, 'code' | 'type'>
  ): Promise<VerificationCodeEntity | null>;
  deleteVerificationCode(code: string): Promise<VerificationCodeEntity | null>;
  countVerificationCodes(
    verification: Pick<VerificationCodeEntity, 'userId' | 'type'>,
    createdAtQuery?: { $gt?: Date; $lt?: Date }
  ): Promise<number>;
  findVerificationCodeByCode(
    code: string
  ): Promise<VerificationCodeEntity | null>;
  updateVerificationCode(
    filter: Partial<VerificationCodeEntity>,
    update: Partial<VerificationCodeEntity>
  ): Promise<VerificationCodeEntity | null>;
  deleteVerificationCodesByUserIdAndType(
    userId: string,
    type: VerificationEnum
  ): Promise<{ deletedCount: number } | null>;
}
