import mongoose from 'mongoose';
import { UserEntity } from '../entities/user.entity';
import { UserRepository } from '../interfaces/user.repository';
import { VerificationRepository } from '../interfaces/verification.repository';
import { fortyFiveMinutesFromNow } from '../../utils/date-time';
import { VerificationEnum } from '../entities/verificationCode.entity';
import { config } from '../../config/env';
import { sendEmail } from '../../infrastructure/email/services/emailService';
import { verifyEmailTemplate } from '../../infrastructure/email/templates/template';

export class AuthUseCase {
  constructor(
    private userRepository: UserRepository,
    private verificationCodeRepository: VerificationRepository
  ) {}

  async register(
    user: Pick<UserEntity, 'name' | 'email' | 'password'>
  ): Promise<UserEntity> {
    const existingUser = await this.userRepository.findByEmail(user.email);

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const newUser = await this.userRepository.create(user);

    const userId = newUser._id as mongoose.Types.ObjectId;

    const verification =
      await this.verificationCodeRepository.createVerificationCode({
        expiresAt: fortyFiveMinutesFromNow(),
        userId: userId,
        type: VerificationEnum.EMAIL_VERIFICATION
      });

    const verificationUrl = `${config.APP_ORIGIN}/confirm-account?code=${verification.code}`;
    await sendEmail({
      to: newUser.email,
      ...verifyEmailTemplate(verificationUrl)
    });

    return newUser;
  }
  // Login a user
}
