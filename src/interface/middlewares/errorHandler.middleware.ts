/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from 'express';
import logger from '../../utils/logger';
import { HTTPSTATUS } from '../../config/http.config';
import { config } from '../../config/env';

const sendErrorDev = (err: any, res: Response): void => {
  res.status(err.statusCode || HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
    status: err.status || 'error',
    error: err,
    message: err.message,
    stack: err.stack
  });
};

const sendErrorProd = (err: any, res: Response): void => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  } else {
    // Programming or other unknown error: don't leak error details
    logger.error('ERROR 💥', err);
    res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
      status: 'error',
      message: 'Something went very wrong!'
    });
  }
};

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Map of custom error types to their status codes
  const ERROR_STATUS_MAP: { [key: string]: number } = {
    NotFoundError: HTTPSTATUS.NOT_FOUND,
    BadRequestError: HTTPSTATUS.BAD_REQUEST,
    UnauthorizedError: HTTPSTATUS.UNAUTHORIZED,
    ForbiddenError: HTTPSTATUS.FORBIDDEN,
    ConflictError: HTTPSTATUS.CONFLICT,
    UnprocessableEntityError: HTTPSTATUS.UNPROCESSABLE_ENTITY,
    InternalServerError: HTTPSTATUS.INTERNAL_SERVER_ERROR,
    NotImplemented: HTTPSTATUS.NOT_IMPLEMENTED,
    BadGateway: HTTPSTATUS.BAD_GATEWAY,
    ServiceUnavailable: HTTPSTATUS.SERVICE_UNAVAILABLE,
    GatewayTimeout: HTTPSTATUS.GATEWAY_TIMEOUT,
    TooManyRequests: HTTPSTATUS.TOO_MANY_REQUESTS
  };

  // Dynamically set statusCode based on error name
  if (err.name && ERROR_STATUS_MAP[err.name]) {
    err.statusCode = ERROR_STATUS_MAP[err.name];
    err.status = 'error';
  }

  // Fallback for unhandled errors
  err.statusCode = err.statusCode || HTTPSTATUS.INTERNAL_SERVER_ERROR;
  err.status = err.status || 'error';

  // Set proper Content-Type for API responses
  res.setHeader('Content-Type', 'application/json');

  if (config.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (config.NODE_ENV === 'production' || config.NODE_ENV === 'test') {
    sendErrorProd(err, res);
  }

  // Always call next() to satisfy the middleware signature
  next();
};
