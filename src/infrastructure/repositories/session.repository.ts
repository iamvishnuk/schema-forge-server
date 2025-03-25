import { DeleteResult } from 'mongoose';
import { SessionEntity } from '../../core/entities/session.entity';
import { SessionRepository } from '../../core/interfaces/session.repository';
import { SessionModel } from '../models/session.model';

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
}
