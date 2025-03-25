import { Request, Response } from 'express';
import { MfaUseCase } from '../../core/useCases/maf.usecase';
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
}
