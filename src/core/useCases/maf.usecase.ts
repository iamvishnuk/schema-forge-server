import { UserEntity } from '../entities/user.entity';
import { SessionRepository } from '../interfaces/session.repository';
import { UserRepository } from '../interfaces/user.repository';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';

export class MfaUseCase {
  constructor(
    private userRepository: UserRepository,
    private sessionRepository: SessionRepository
  ) {}

  async generateMFASetup(
    user: UserEntity
  ): Promise<{ message: string; qrImageUrl: string; secret: string }> {
    if (user.userPreferences.enable2FA) {
      return {
        message: '2FA is already enabled',
        qrImageUrl: '',
        secret: ''
      };
    }

    let secretKey = user.userPreferences.twoFactorSecret;

    if (!secretKey) {
      const secret = speakeasy.generateSecret({ name: 'SchemaForge' });
      secretKey = secret.base32;
      user.userPreferences.twoFactorSecret = secretKey;
      await user.save();
    }

    const url = speakeasy.otpauthURL({
      secret: secretKey,
      label: user.name,
      issuer: 'schemaforge.com',
      encoding: 'base32'
    });

    const qrCode = await qrcode.toDataURL(url);

    return {
      message: '2FA setup successful',
      qrImageUrl: qrCode,
      secret: secretKey
    };
  }
}
