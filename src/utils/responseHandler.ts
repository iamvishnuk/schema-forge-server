// responseHandler.ts

import { Response } from 'express';
import { config } from '../config/env';
import { HttpStatusCode } from '../config/http.config';
import { calculateExpirationDate } from './date-time';

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

  static authSuccess<T>(
    res: Response,
    data: T,
    accessToken: string | undefined,
    refreshToken: string | undefined,
    statusCode: HttpStatusCode = 200,
    message = 'Authentication successful'
  ): Response {
    if (accessToken) {
      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: config.NODE_ENV === 'production' ? true : false,
        sameSite: config.NODE_ENV === 'production' ? 'strict' : 'lax',
        expires: calculateExpirationDate(config.JWT_EXPIRES_IN)
      });
    }

    if (refreshToken) {
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: config.NODE_ENV === 'production' ? true : false,
        sameSite: config.NODE_ENV === 'production' ? 'strict' : 'lax',
        expires: calculateExpirationDate(config.JWT_REFRESH_EXPIRES_IN),
        path: `${config.BASE_PATH}/auth/refresh`
      });
    }

    // Return response with tokens in body
    return res.status(statusCode).json({
      status: 'success',
      message,
      data,
      tokens: {
        accessToken,
        refreshToken
      }
    });
  }

  static clearCookies(
    res: Response,
    statusCode: HttpStatusCode = 200,
    message: string = 'Cookies cleared'
  ): Response {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken', {
      path: `${config.BASE_PATH}/auth/refresh`
    });
    return res.status(statusCode).json({
      status: 'success',
      message
    });
  }
}
