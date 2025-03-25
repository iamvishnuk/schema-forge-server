import { Request, Response } from 'express';
import { AuthUseCase } from '../../core/useCases/auth.usecase';
import { UserRepositoryImpl } from '../../infrastructure/repositories/user.repository';
import { VerificationCodeImpl } from '../../infrastructure/repositories/verification.repository';
import { asyncHandler } from '../../utils/asyncHandler';
import { ResponseHandler } from '../../utils/responseHandler';
import { HTTPSTATUS } from '../../config/http.config';
import { SessionRepositoryImpl } from '../../infrastructure/repositories/session.repository';
import { NotFoundError, UnauthorizedError } from '../../utils/error';

export class AuthController {
  private userRepository: UserRepositoryImpl;
  private authUseCase: AuthUseCase;
  private verificationCodeRepository: VerificationCodeImpl;
  private sessionRepository: SessionRepositoryImpl;

  constructor() {
    this.userRepository = new UserRepositoryImpl();
    this.verificationCodeRepository = new VerificationCodeImpl();
    this.sessionRepository = new SessionRepositoryImpl();
    this.authUseCase = new AuthUseCase(
      this.userRepository,
      this.verificationCodeRepository,
      this.sessionRepository
    );
  }

  public register = asyncHandler(async (req: Request, res: Response) => {
    const user = req.body;
    const newUser = await this.authUseCase.register(user);
    ResponseHandler.success(
      res,
      newUser,
      HTTPSTATUS.CREATED,
      'User registered successfully'
    );
  });

  public login = asyncHandler(async (req: Request, res: Response) => {
    const userAgent = req.headers['user-agent'];
    const body = { ...req.body, userAgent };
    const { user, mfaRequired, accessToken, refreshToken } =
      await this.authUseCase.login(body);

    if (mfaRequired) {
      return ResponseHandler.success(
        res,
        { user, mfaRequired },
        HTTPSTATUS.OK,
        'MFA required'
      );
    }

    ResponseHandler.authSuccess(
      res,
      { user, mfaRequired },
      accessToken,
      refreshToken,
      HTTPSTATUS.OK,
      'User Logged in successfully'
    );
  });

  public refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.cookies as Record<string, string | undefined>;

    if (!refreshToken) {
      throw new UnauthorizedError('Missing refresh token');
    }

    const { accessToken, newRefreshToken } =
      await this.authUseCase.refreshToken(refreshToken);

    ResponseHandler.authSuccess(
      res,
      {},
      accessToken,
      newRefreshToken,
      HTTPSTATUS.OK,
      'Token refreshed successfully'
    );
  });

  public verifyEmail = asyncHandler(async (req: Request, res: Response) => {
    const { code } = req.body;
    await this.authUseCase.verifyEmail(code);
    ResponseHandler.success(
      res,
      {},
      HTTPSTATUS.OK,
      'Email verified successfully'
    );
  });

  public forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;
    await this.authUseCase.forgotPassword(email);
    ResponseHandler.success(
      res,
      {},
      HTTPSTATUS.OK,
      'Password reset email sent successfully'
    );
  });

  public resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const { password, code } = req.body;
    await this.authUseCase.resetPassword(password, code);
    return ResponseHandler.success(
      res,
      {},
      HTTPSTATUS.OK,
      'Password reset successfully'
    );
  });

  public logout = asyncHandler(async (req: Request, res: Response) => {
    const { sessionId } = req;

    if (!sessionId) {
      throw new NotFoundError('Session not found');
    }

    await this.authUseCase.logout(sessionId);

    return ResponseHandler.clearCookies(
      res,
      HTTPSTATUS.OK,
      'Logout successful'
    );
  });
}
