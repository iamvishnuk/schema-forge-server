import mongoose from 'mongoose';
import { UserEntity } from '../entities/user.entity';
import { UserRepository } from '../interfaces/user.repository';
import { VerificationRepository } from '../interfaces/verification.repository';
import {
  anHourFromNow,
  calculateExpirationDate,
  fortyFiveMinutesFromNow,
  ONE_DAY_IN_MILLISECONDS,
  threeMinutesAgo
} from '../../utils/date-time';
import { VerificationEnum } from '../entities/verificationCode.entity';
import { config } from '../../config/env';
import {
  passwordResetTemplate,
  verifyEmailTemplate
} from '../../infrastructure/services/email/templates/template';
import { SessionRepository } from '../interfaces/session.repository';
import {
  accessTokenSignOptions,
  RefreshTokenPayload,
  refreshTokenSignOptions,
  signJwtToken,
  verifyJwtToken
} from '../../utils/jwt';
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  TooManyRequests,
  UnauthorizedError
} from '../../utils/error';
import { hashValue } from '../../utils/bcrypt';
import { SessionEntity } from '../entities/session.entity';
import { IEmailService } from '../../infrastructure/services/email/interface/IEmailService';

export class AuthUseCase {
  constructor(
    private userRepository: UserRepository,
    private verificationCodeRepository: VerificationRepository,
    private sessionRepository: SessionRepository,
    private emailService: IEmailService
  ) {}

  /**
   * Registers a new user in the system
   * @param user The user data containing name, email and password
   * @returns The newly created user entity
   * @throws Error if a user with the provided email already exists
   */
  async register(
    user: Pick<UserEntity, 'name' | 'email' | 'password'>
  ): Promise<UserEntity> {
    // Check if a user with the provided email already exists
    const existingUser = await this.userRepository.findByEmail(user.email);

    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    // Create the new user in the database
    const newUser = await this.userRepository.create(user);

    const userId = newUser._id as mongoose.Types.ObjectId;

    // Create a verification code for email verification
    const verification =
      await this.verificationCodeRepository.createVerificationCode({
        expiresAt: fortyFiveMinutesFromNow(),
        userId: userId,
        type: VerificationEnum.EMAIL_VERIFICATION
      });

    // Generate the verification URL for the email
    const verificationUrl = `${config.APP_ORIGIN}/confirm-account?code=${verification.code}`;

    // Send verification email to the user
    // await sendEmail({
    //   to: newUser.email,
    //   ...verifyEmailTemplate(verificationUrl)
    // });

    await this.emailService.sendEmail({
      to: newUser.email,
      ...verifyEmailTemplate(verificationUrl)
    });

    return newUser;
  }

  /**
   * Authenticates a user and creates a new session
   * @param data Object containing email, password, and userAgent
   * @returns Object with user data, MFA status, and authentication tokens
   * @throws Error if email/password are invalid
   */
  async login(data: {
    email: string;
    password: string;
    userAgent: string;
  }): Promise<{
    user: UserEntity;
    mfaRequired: boolean;
    accessToken: string;
    refreshToken: string;
  }> {
    // Find user by email
    const user = await this.userRepository.findByEmail(data.email);

    if (!user) {
      throw new BadRequestError('Invalid email or password');
    }

    // Verify password against stored hash
    const isPasswordMatch = await user.comparePassword(data.password);
    if (!isPasswordMatch) {
      throw new BadRequestError('Invalid email or password');
    }

    // check if the user email is verified
    if (!user.isEmailVerified) {
      throw new BadRequestError('Email not verified');
    }

    // If user has 2FA enabled, return early without tokens
    if (user?.userPreferences.enable2FA) {
      return {
        user,
        mfaRequired: true,
        accessToken: '',
        refreshToken: ''
      };
    }

    // Create a new session for the authenticated user
    const session = await this.sessionRepository.create({
      userId: user._id as mongoose.Types.ObjectId,
      userAgent: data.userAgent
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

    // Return user data and authentication tokens
    return {
      user,
      mfaRequired: false,
      accessToken,
      refreshToken
    };
  }

  /**
   * Refreshes an authentication session using a refresh token
   * @param refreshToken The JWT refresh token to validate
   * @returns Object containing a new access token and optionally a new refresh token
   * @throws UnauthorizedError if the token is invalid or expired
   */
  public async refreshToken(
    refreshToken: string
  ): Promise<{ accessToken: string; newRefreshToken: string | undefined }> {
    // Verify the provided refresh token is valid and extract its payload
    const { payload } = verifyJwtToken<RefreshTokenPayload>(refreshToken, {
      secret: refreshTokenSignOptions.secret
    });

    if (!payload) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    // Find the session associated with this refresh token
    const session = await this.sessionRepository.findById(
      payload.sessionId as string
    );
    const now = Date.now();

    // Validate that the session exists and hasn't expired
    if (!session || session.expiredAt.getTime() <= now) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    // Check if the session is close to expiring (less than one day remaining)
    const sessionRequireRefresh =
      session.expiredAt.getTime() - now < ONE_DAY_IN_MILLISECONDS;

    // If the session is close to expiring, extend its expiration date
    if (sessionRequireRefresh) {
      session.expiredAt = calculateExpirationDate(
        config.JWT_REFRESH_EXPIRES_IN
      );
      await session.save();
    }

    // Generate a new refresh token only if the session was extended
    const newRefreshToken = sessionRequireRefresh
      ? signJwtToken({ sessionId: session._id }, refreshTokenSignOptions)
      : undefined;

    // Generate a new access token with user and session information
    const accessToken = signJwtToken(
      {
        userId: session.userId,
        sessionId: session._id
      },
      accessTokenSignOptions
    );

    // Return both tokens
    return {
      accessToken,
      newRefreshToken
    };
  }

  /**
   * Verifies a user's email address using the provided verification code.
   *
   * @param code - The verification code sent to the user's email
   * @returns A Promise that resolves to the updated UserEntity with verified email
   * @throws {BadRequestError} When the verification code is invalid or expired
   * @throws {BadRequestError} When the user cannot be updated
   *
   * @remarks
   * The method performs the following steps:
   * 1. Validates the verification code from the repository
   * 2. Updates the user's email verification status
   * 3. Deletes the used verification code from the repository
   */
  public async verifyEmail(code: string): Promise<UserEntity> {
    const validCode =
      await this.verificationCodeRepository.findUnExpiredVerificationCode({
        code,
        type: VerificationEnum.EMAIL_VERIFICATION
      });

    if (!validCode) {
      throw new BadRequestError('Invalid or expired verification code');
    }

    const updatedUser = await this.userRepository.findByIdAndUpdate(
      validCode.userId,
      { isEmailVerified: true }
    );

    if (!updatedUser) {
      throw new BadRequestError('Unable to verify email address');
    }

    await this.verificationCodeRepository.deleteVerificationCode(code);

    return updatedUser;
  }

  /**
   * Handles forgotten password requests by generating a password reset link
   * @param email The email address of the user requesting password reset
   * @returns Object containing the reset URL and email tracking ID
   * @throws BadRequestError if the user is not found
   * @throws TooManyRequests if too many reset attempts are made in a short period
   * @throws InternalServerError if the email fails to send
   */
  public async forgotPassword(
    email: string
  ): Promise<{ url: string; emailId: string }> {
    // Find the user by email address
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Define rate limiting parameters
    const timeAgo = threeMinutesAgo();
    const maxAttempts = 2;

    // Check if user has made too many reset attempts recently
    const verificationAttemptsCount =
      await this.verificationCodeRepository.countVerificationCodes(
        {
          userId: user._id as mongoose.Types.ObjectId,
          type: VerificationEnum.PASSWORD_RESET
        },
        { $gt: timeAgo }
      );

    // Enforce rate limiting to prevent abuse
    if (verificationAttemptsCount >= maxAttempts) {
      throw new TooManyRequests('Too many attempts. Please try again later');
    }

    // Set expiration time for the verification code
    const expiresAt = anHourFromNow();

    // Create a new verification code for password reset
    const verificationCode =
      await this.verificationCodeRepository.createVerificationCode({
        userId: user._id as mongoose.Types.ObjectId,
        type: VerificationEnum.PASSWORD_RESET,
        expiresAt
      });

    // Generate the password reset URL to be sent to the user
    const resetPasswordUrl = `${config.APP_ORIGIN}/reset-password?code=${verificationCode.code}&exp=${expiresAt.getTime()}`;

    // Send the password reset email to the user
    await this.emailService.sendEmail({
      to: user.email,
      ...passwordResetTemplate(resetPasswordUrl)
    });

    // Return the reset URL and email tracking ID
    return {
      url: resetPasswordUrl,
      emailId: user.email
    };
  }

  /**
   * Resets a user's password using a verification code
   * @param password - The new password to set
   * @param code - The verification code received by the user
   * @returns The updated user entity
   * @throws {BadRequestError} When the verification code is invalid or expired
   * @throws {BadRequestError} When the user cannot be updated
   */
  public async resetPassword(
    password: string,
    code: string
  ): Promise<UserEntity> {
    // Validate the verification code exists and hasn't expired
    const validCode =
      await this.verificationCodeRepository.findUnExpiredVerificationCode({
        code,
        type: VerificationEnum.PASSWORD_RESET
      });

    if (!validCode) {
      throw new BadRequestError('Invalid or expired verification code');
    }

    // Hash the new password before storing
    const hashedPassword = await hashValue(password);

    // Update the user's password in the database
    const updatedUser = await this.userRepository.findByIdAndUpdate(
      validCode.userId,
      { password: hashedPassword }
    );

    if (!updatedUser) {
      throw new BadRequestError('Unable to reset password');
    }

    // Remove the used verification code to prevent reuse
    await this.verificationCodeRepository.deleteVerificationCode(code);

    // Invalidate all existing sessions for security
    await this.sessionRepository.deleteMany({ userId: validCode.userId });

    return updatedUser;
  }

  public async logout(sessionId: string): Promise<SessionEntity | null> {
    return await this.sessionRepository.findByIdAndDelete(sessionId);
  }
}
