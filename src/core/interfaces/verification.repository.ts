import { VerificationCodeEntity } from '../entities/verificationCode.entity';

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
}
