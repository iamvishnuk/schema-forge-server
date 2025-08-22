import { Request, Response, NextFunction } from 'express';
import z from 'zod';
import { AppError } from '../../utils/appError';

// request body validation middleware
export const validateRequest = <T extends z.ZodTypeAny>(schema: T) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse(req.body);
      req.body = validatedData; // Assign the transformed data back to req.body
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const message = error.errors
          .map((err) => `${err.path.join('.')}: ${err.message}`)
          .join(', ');
        return next(new AppError(message, 400));
      }
      next(new AppError('Invalid request data', 400));
    }
  };
};

// request params validation middleware
export const validateParams = <T extends z.ZodTypeAny>(schema: T) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse(req.params);
      req.params = validatedData; // Assign the transformed data back to req.params
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const message = error.errors
          .map((err) => `${err.path.join('.')}: ${err.message}`)
          .join(', ');
        return next(new AppError(message, 400));
      }
      next(new AppError('Invalid request data', 400));
    }
  };
};

// request query validation middleware
export const validateQuery = <T extends z.ZodTypeAny>(schema: T) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse(req.query);
      req.query = validatedData; // Assign the transformed data back to req.query
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const message = error.errors
          .map((err) => `${err.path.join('.')}: ${err.message}`)
          .join(', ');
        return next(new AppError(message, 400));
      }
      next(new AppError('Invalid request data', 400));
    }
  };
};
