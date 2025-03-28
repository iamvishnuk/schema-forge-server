// async Handler.ts

import { Request, Response, NextFunction } from 'express';
import { AppError } from './appError';

type AsyncControllerFn = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void | Response>;

export const asyncHandler = (fn: AsyncControllerFn) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
      if (error instanceof AppError) {
        return next(error);
      } else {
        next(new AppError('An Unknown error occurred', 500));
      }
    });
  };
};
