import { UserEntity } from '../entities/user.entity';
import { SessionRepository } from '../interfaces/session.repository';
import { UserRepository } from '../interfaces/user.repository';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError
} from '../../utils/error';
import { Request } from 'express';
import mongoose from 'mongoose';
import { refreshTokenSignOptions, signJwtToken } from '../../utils/jwt';

export class MfaUseCase {
  constructor(
    private userRepository: UserRepository,
    private sessionRepository: SessionRepository
  ) {}

  /**
   * Generates MFA setup for a user
   * @param user - The user entity to set up MFA for
   * @returns Object containing message, QR code image URL and secret key
   */
  async generateMFASetup(
    user: UserEntity
  ): Promise<{ message: string; qrImageUrl: string; secret: string }> {
    // Check if 2FA is already enabled for the user
    if (user.userPreferences.enable2FA) {
      return {
        message: '2FA is already enabled',
        qrImageUrl: '',
        secret: ''
      };
    }

    // Get existing secret key or generate a new one
    let secretKey = user.userPreferences.twoFactorSecret;

    if (!secretKey) {
      // Generate a new secret key
      const secret = speakeasy.generateSecret({ name: 'SchemaForge' });
      secretKey = secret.base32;
      // Save the secret key to user preferences
      user.userPreferences.twoFactorSecret = secretKey;
      await user.save();
    }

    // Generate OTP auth URL for QR code
    const url = speakeasy.otpauthURL({
      secret: secretKey,
      label: user.name,
      issuer: 'schemaforge.com',
      encoding: 'base32'
    });

    // Generate QR code as data URL
    const qrCode = await qrcode.toDataURL(url);

    return {
      message: '2FA setup successful',
      qrImageUrl: qrCode,
      secret: secretKey
    };
  }

  /**
   * Verifies MFA setup with provided code
   * @param user - The user entity to verify MFA setup for
   * @param code - The TOTP code provided by the user
   * @param secretKey - The secret key used to verify the TOTP code
   * @returns Object containing message and user's 2FA preferences
   */
  async verifyMFASetup(
    user: UserEntity,
    code: string,
    secretKey: string
  ): Promise<{ message: string; userPreferences: { enable2FA: boolean } }> {
    // Check if 2FA is already enabled for the user
    if (user.userPreferences.enable2FA) {
      return {
        message: '2FA is already enabled',
        userPreferences: {
          enable2FA: user.userPreferences.enable2FA
        }
      };
    }

    // Verify the provided TOTP code against the secret key
    const isValid = speakeasy.totp.verify({
      secret: secretKey,
      encoding: 'base32',
      token: code
    });

    // If the code is invalid, throw an error
    if (!isValid) {
      throw new BadRequestError('Invalid MFA code, please try again');
    }

    // Enable 2FA for the user
    user.userPreferences.enable2FA = true;
    await user.save();

    // Return success message and updated preferences
    return {
      message: '2FA setup successful',
      userPreferences: {
        enable2FA: user.userPreferences.enable2FA
      }
    };
  }

  /**
   * Disables MFA for an authenticated user
   * @param req - Express request object containing the authenticated user
   * @returns Object containing result message and updated user's 2FA preferences
   * @throws UnauthorizedError if user is not authenticated
   */
  async revokeMFA(
    req: Request
  ): Promise<{ message: string; userPreferences: { enable2FA: boolean } }> {
    // Get user from the request object
    const user = req.user;

    // Check if user is authenticated
    if (!user) {
      throw new UnauthorizedError('user not authorized');
    }

    // Check if 2FA is already disabled for the user
    if (!user.userPreferences.enable2FA) {
      return {
        message: '2FA is already disabled',
        userPreferences: {
          enable2FA: user.userPreferences.enable2FA
        }
      };
    }

    // Reset two-factor authentication settings
    user.userPreferences.twoFactorSecret = undefined;
    user.userPreferences.enable2FA = false;

    // Save the updated user preferences
    await user.save();

    // Return success message and updated preferences
    return {
      message: '2FA disabled successfully',
      userPreferences: {
        enable2FA: user.userPreferences.enable2FA
      }
    };
  }

  /**
   * Verifies a user's MFA code during login
   * @param code - The TOTP code provided by the user
   * @param email - The email of the user attempting to login
   * @param userAgent - The user agent string from the request
   * @returns Object containing user entity, access token, and refresh token
   * @throws NotFoundError if user is not found
   * @throws BadRequestError if 2FA is not enabled or code is invalid
   */
  async verifyMfaLogin(
    code: string,
    email: string,
    userAgent: string | undefined
  ): Promise<{ user: UserEntity; accessToken: string; refreshToken: string }> {
    // Find user by email
    const user = await this.userRepository.findByEmail(email);

    // Check if user exists
    if (!user) {
      throw new NotFoundError('user not found');
    }

    // Verify that 2FA is enabled for this user
    if (
      !user.userPreferences.enable2FA &&
      !user.userPreferences.twoFactorSecret
    ) {
      throw new BadRequestError('2FA is not enabled for this user');
    }

    // Verify the provided TOTP code against the user's secret
    const isValid = speakeasy.totp.verify({
      secret: user.userPreferences.twoFactorSecret!,
      encoding: 'base32',
      token: code
    });

    // If code is invalid, throw an error
    if (!isValid) {
      throw new BadRequestError('Invalid MFA code, please try again');
    }

    // Create a new session for the authenticated user
    const session = await this.sessionRepository.create({
      userId: user._id as mongoose.Types.ObjectId,
      userAgent: userAgent as string
    });

    // Generate access token containing user and session IDs
    const accessToken = signJwtToken({
      userId: user._id,
      sessionId: session._id
    });

    // Generate refresh token containing only session ID
    const refreshToken = signJwtToken(
      {
        sessionId: session._id
      },
      refreshTokenSignOptions
    );

    // Return user information and tokens
    return {
      user,
      accessToken,
      refreshToken
    };
  }
}
