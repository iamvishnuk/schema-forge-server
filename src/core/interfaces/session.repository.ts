import { DeleteResult } from 'mongoose';
import { SessionEntity } from '../entities/session.entity';

export interface SessionRepository {
  create(
    data: Pick<SessionEntity, 'userId' | 'userAgent'>
  ): Promise<SessionEntity>;
  findById(id: string): Promise<SessionEntity | null>;
  findByIdAndDelete(id: string): Promise<SessionEntity | null>;
  deleteMany(filter: Partial<SessionEntity>): Promise<DeleteResult | null>;
}
