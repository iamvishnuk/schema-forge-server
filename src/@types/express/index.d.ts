import 'express';
import { UserEntity } from '../../core/entities/user.entity';

declare global {
  namespace Express {
    interface Request {
      sessionId?: string;
      user?: UserEntity;
    }
  }
}

export {};
