// responseHandler.ts

import { Response } from 'express';
import { config } from '../config/env';
import { HttpStatusCode } from '../config/http.config';

export class ResponseHandler {
  static success<T>(
    res: Response,
    data: T,
    statusCode: HttpStatusCode = 200,
    message = 'Success'
  ): Response {
    return res.status(statusCode).json({
      status: 'success',
      message,
      data
    });
  }

  static error(
    res: Response,
    error: Error,
    statusCode: HttpStatusCode = 500
  ): Response {
    return res.status(statusCode).json({
      status: 'error',
      message: error.message,
      stack: config.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
