import { VerificationCodeEntity } from '../../core/entities/verificationCode.entity';
import { VerificationRepository } from '../../core/interfaces/verification.repository';
import { VerificationCodeModel } from '../models/verificationCode.model';

export class VerificationCodeImpl implements VerificationRepository {
  countVerificationCodes(
    verification: Pick<VerificationCodeEntity, 'userId' | 'type' | 'createdAt'>
  ): Promise<number> {
    return VerificationCodeModel.countDocuments({
      userId: verification.userId,
      type: verification.type,
      createdAt: verification.createdAt
    });
  }

  createVerificationCode(
    verification: Pick<VerificationCodeEntity, 'expiresAt' | 'userId' | 'type'>
  ): Promise<VerificationCodeEntity> {
    return VerificationCodeModel.create(verification);
  }

  findVerificationCode(
    verification: Pick<VerificationCodeEntity, 'code' | 'type' | 'expiresAt'>
  ): Promise<VerificationCodeEntity | null> {
    return VerificationCodeModel.findOne({
      code: verification.code,
      type: verification.type,
      expiresAt: verification.expiresAt
    });
  }

  deleteVerificationCode(code: string): Promise<VerificationCodeEntity | null> {
    return VerificationCodeModel.findOneAndDelete({ code });
  }
}
