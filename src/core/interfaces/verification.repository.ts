import { VerificationCodeEntity } from '../entities/verificationCode.entity';

export interface VerificationRepository {
  createVerificationCode(
    verification: Pick<VerificationCodeEntity, 'expiresAt' | 'userId' | 'type'>
  ): Promise<VerificationCodeEntity>;
  findVerificationCode(
    verification: Pick<VerificationCodeEntity, 'code' | 'type' | 'expiresAt'>
  ): Promise<VerificationCodeEntity | null>;
  deleteVerificationCode(code: string): Promise<VerificationCodeEntity | null>;
  countVerificationCodes(
    verification: Pick<VerificationCodeEntity, 'userId' | 'type' | 'createdAt'>
  ): Promise<number>;
}
