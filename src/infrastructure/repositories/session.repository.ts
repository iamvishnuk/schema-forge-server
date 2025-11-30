import { DeleteResult } from 'mongoose';
import { SessionEntity } from '../../core/entities/session.entity';
import { SessionRepository } from '../../core/interfaces/session.repository';
import { SessionModel } from '../models/session.model';
import { UserEntity } from '../../core/entities/user.entity';

export class SessionRepositoryImpl implements SessionRepository {
  async findById(id: string): Promise<SessionEntity | null> {
    return SessionModel.findById(id);
  }

  findByIdAndDelete(id: string): Promise<SessionEntity | null> {
    return SessionModel.findByIdAndDelete(id);
  }

  async create(
    data: Pick<SessionEntity, 'userId' | 'userAgent'>
  ): Promise<SessionEntity> {
    return SessionModel.create(data);
  }

  deleteMany(filter: Partial<SessionEntity>): Promise<DeleteResult | null> {
    return SessionModel.deleteMany(filter);
  }

  getAllSession(userId: string): Promise<SessionEntity[]> {
    return SessionModel.find(
      { userId, expiredAt: { $gt: new Date() } },
      { _id: 1, userId: 1, userAgent: 1, createdAt: 1, expiredAt: 1 },
      { sort: { createdAt: -1 } }
    );
  }

  findCurrentSessionById(
    sessionId: string
  ): Promise<(SessionEntity & { userId: UserEntity }) | null> {
    return SessionModel.findById(sessionId)
      .populate('userId')
      .select('-expiredAt');
  }

  findOneAndDelete(
    filter: Partial<SessionEntity>
  ): Promise<SessionEntity | null> {
    return SessionModel.findOneAndDelete(filter);
  }
}
