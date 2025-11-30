import { Request, Response } from 'express';
import { MfaUseCase } from '../../core/useCases/mfa.usecase';
import { SessionRepositoryImpl } from '../../infrastructure/repositories/session.repository';
import { UserRepositoryImpl } from '../../infrastructure/repositories/user.repository';
import { asyncHandler } from '../../utils/asyncHandler';
import { UnauthorizedError } from '../../utils/error';
import { ResponseHandler } from '../../utils/responseHandler';
import { HTTPSTATUS } from '../../config/http.config';

export class MfaController {
  private userRepository: UserRepositoryImpl;
  private sessionRepository: SessionRepositoryImpl;
  private mfaUseCase: MfaUseCase;

  constructor() {
    this.userRepository = new UserRepositoryImpl();
    this.sessionRepository = new SessionRepositoryImpl();
    this.mfaUseCase = new MfaUseCase(
      this.userRepository,
      this.sessionRepository
    );
  }

  public generateMFASetup = asyncHandler(
    async (req: Request, res: Response) => {
      const user = req.user;
      if (!user) {
        throw new UnauthorizedError('user not authorized');
      }
      const { message, secret, qrImageUrl } =
        await this.mfaUseCase.generateMFASetup(user);

      ResponseHandler.success(
        res,
        { secret, qrImageUrl },
        HTTPSTATUS.OK,
        message
      );
    }
  );

  public verifyMFASetup = asyncHandler(async (req: Request, res: Response) => {
    const { code, secretKey } = req.body;
    const user = req.user;

    if (!user) {
      throw new UnauthorizedError('user not authorized');
    }

    const { message, userPreferences } = await this.mfaUseCase.verifyMFASetup(
      user,
      code,
      secretKey
    );

    ResponseHandler.success(res, { userPreferences }, HTTPSTATUS.OK, message);
  });

  public revokeMFA = asyncHandler(async (req: Request, res: Response) => {
    const { message, userPreferences } = await this.mfaUseCase.revokeMFA(req);

    ResponseHandler.success(res, { userPreferences }, HTTPSTATUS.OK, message);
  });

  public verifyMfaLogin = asyncHandler(async (req: Request, res: Response) => {
    const { code, email } = req.body;
    const userAgent = req.headers['user-agent'];

    const { user, accessToken, refreshToken } =
      await this.mfaUseCase.verifyMfaLogin(code, email, userAgent);

    ResponseHandler.authSuccess(
      res,
      { user },
      accessToken,
      refreshToken,
      HTTPSTATUS.OK,
      'User Logged in successfully'
    );
  });
}
