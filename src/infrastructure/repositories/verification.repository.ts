import { VerificationCodeEntity } from '../../core/entities/verificationCode.entity';
import { VerificationRepository } from '../../core/interfaces/verification.repository';
import { VerificationCodeModel } from '../models/verificationCode.model';

export class VerificationCodeImpl implements VerificationRepository {
  countVerificationCodes(
    verification: Pick<VerificationCodeEntity, 'userId' | 'type'>,
    createdAtQuery?: { $gt?: Date; $lt?: Date }
  ): Promise<number> {
    return VerificationCodeModel.countDocuments({
      userId: verification.userId,
      type: verification.type,
      ...(createdAtQuery ? { createdAt: createdAtQuery } : {})
    });
  }

  createVerificationCode(
    verification: Pick<VerificationCodeEntity, 'expiresAt' | 'userId' | 'type'>
  ): Promise<VerificationCodeEntity> {
    return VerificationCodeModel.create(verification);
  }

  findUnExpiredVerificationCode(
    verification: Pick<VerificationCodeEntity, 'code' | 'type'>
  ): Promise<VerificationCodeEntity | null> {
    return VerificationCodeModel.findOne({
      code: verification.code,
      type: verification.type,
      expiresAt: { $gt: new Date() }
    });
  }

  deleteVerificationCode(code: string): Promise<VerificationCodeEntity | null> {
    return VerificationCodeModel.findOneAndDelete({ code });
  }
}
