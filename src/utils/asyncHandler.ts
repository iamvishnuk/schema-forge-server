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
      if (error instanceof Error) {
        if (error.message === 'User not found') {
          return next(new AppError(error.message, 404));
        } else if (error.message === 'User with this email already exists') {
          return next(new AppError(error.message, 409));
        }
        next(new AppError(error.message, 400));
      } else {
        next(new AppError('An Unknown error occurred', 500));
      }
    });
  };
};
