import { Request, Response } from 'express';
import { SessionUseCase } from '../../core/useCases/session.usecase';
import { SessionRepositoryImpl } from '../../infrastructure/repositories/session.repository';
import { asyncHandler } from '../../utils/asyncHandler';
import { ResponseHandler } from '../../utils/responseHandler';
import { HTTPSTATUS } from '../../config/http.config';
import { UnauthorizedError } from '../../utils/error';
import mongoose from 'mongoose';

export class SessionController {
  private sessionRepository: SessionRepositoryImpl;
  private sessionUseCase: SessionUseCase;

  constructor() {
    this.sessionRepository = new SessionRepositoryImpl();
    this.sessionUseCase = new SessionUseCase(this.sessionRepository);
  }

  public getAllSession = asyncHandler(async (req: Request, res: Response) => {
    const sessionId = req.sessionId;

    if (!req.user) {
      throw new UnauthorizedError('Session not found');
    }

    const userId = req.user._id as string;

    const sessions = await this.sessionUseCase.getAllSession(userId);

    const modifiedSessions = sessions.map((session) => ({
      ...session.toObject(),
      isCurrent: String(session._id) === sessionId
    }));

    ResponseHandler.success(
      res,
      modifiedSessions,
      HTTPSTATUS.OK,
      'All session fetched successful'
    );
  });

  public getCurrentSession = asyncHandler(
    async (req: Request, res: Response) => {
      const sessionId = req.sessionId;

      if (!sessionId) {
        return ResponseHandler.success(
          res,
          {},
          HTTPSTATUS.NOT_FOUND,
          'No active session found'
        );
      }

      const user = await this.sessionUseCase.getCurrentSession(sessionId);

      ResponseHandler.success(
        res,
        user,
        HTTPSTATUS.OK,
        'Current session fetched successful'
      );
    }
  );

  public deleteSession = asyncHandler(async (req: Request, res: Response) => {
    const sessionId = req.params.id;
    const userId = req.user?._id as mongoose.Types.ObjectId;

    await this.sessionUseCase.deleteSession(sessionId, userId);

    ResponseHandler.success(res, {}, HTTPSTATUS.OK, 'Session deleted');
  });
}
