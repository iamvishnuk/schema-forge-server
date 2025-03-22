import { Request, Response } from 'express';
import { AuthUseCase } from '../../core/useCases/auth.usecase';
import { UserRepositoryImpl } from '../../infrastructure/repositories/user.repository';
import { VerificationCodeImpl } from '../../infrastructure/repositories/verification.repository';
import { asyncHandler } from '../../utils/asyncHandler';
import { ResponseHandler } from '../../utils/responseHandler';
import { HTTPSTATUS } from '../../config/http.config';

export class AuthController {
  private userRepository: UserRepositoryImpl;
  private authUseCase: AuthUseCase;
  private verificationCodeRepository: VerificationCodeImpl;

  constructor() {
    this.userRepository = new UserRepositoryImpl();
    this.verificationCodeRepository = new VerificationCodeImpl();
    this.authUseCase = new AuthUseCase(
      this.userRepository,
      this.verificationCodeRepository
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
}
