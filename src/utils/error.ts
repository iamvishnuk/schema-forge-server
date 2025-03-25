import { HTTPSTATUS } from '../config/http.config';
import { AppError } from './appError';

export class NotFoundError extends AppError {
  constructor(message: string, statusCode: number = HTTPSTATUS.NOT_FOUND) {
    super(message, statusCode);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string, statusCode: number = HTTPSTATUS.BAD_REQUEST) {
    super(message, statusCode);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string, statusCode: number = HTTPSTATUS.UNAUTHORIZED) {
    super(message, statusCode);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string, statusCode: number = HTTPSTATUS.FORBIDDEN) {
    super(message, statusCode);
  }
}

export class ConflictError extends AppError {
  constructor(message: string, statusCode: number = HTTPSTATUS.CONFLICT) {
    super(message, statusCode);
  }
}

export class UnprocessableEntityError extends AppError {
  constructor(
    message: string,
    statusCode: number = HTTPSTATUS.UNPROCESSABLE_ENTITY
  ) {
    super(message, statusCode);
  }
}

export class InternalServerError extends AppError {
  constructor(
    message: string,
    statusCode: number = HTTPSTATUS.INTERNAL_SERVER_ERROR
  ) {
    super(message, statusCode);
  }
}

export class NotImplemented extends AppError {
  constructor(
    message: string,
    statusCode: number = HTTPSTATUS.NOT_IMPLEMENTED
  ) {
    super(message, statusCode);
  }
}

export class BadGateway extends AppError {
  constructor(message: string, statusCode: number = HTTPSTATUS.BAD_GATEWAY) {
    super(message, statusCode);
  }
}

export class ServiceUnavailable extends AppError {
  constructor(
    message: string,
    statusCode: number = HTTPSTATUS.SERVICE_UNAVAILABLE
  ) {
    super(message, statusCode);
  }
}

export class GatewayTimeout extends AppError {
  constructor(
    message: string,
    statusCode: number = HTTPSTATUS.GATEWAY_TIMEOUT
  ) {
    super(message, statusCode);
  }
}

export class TooManyRequests extends AppError {
  constructor(
    message: string,
    statusCode: number = HTTPSTATUS.TOO_MANY_REQUESTS
  ) {
    super(message, statusCode);
  }
}
