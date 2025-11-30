import { DeleteResult } from 'mongoose';
import { SessionEntity } from '../entities/session.entity';
import { UserEntity } from '../entities/user.entity';

export interface SessionRepository {
  create(
    data: Pick<SessionEntity, 'userId' | 'userAgent'>
  ): Promise<SessionEntity>;
  findById(id: string): Promise<SessionEntity | null>;
  findByIdAndDelete(id: string): Promise<SessionEntity | null>;
  deleteMany(filter: Partial<SessionEntity>): Promise<DeleteResult | null>;
  getAllSession(userId: string): Promise<SessionEntity[]>;
  findCurrentSessionById(
    sessionId: string
  ): Promise<(SessionEntity & { userId: UserEntity }) | null>;
  findOneAndDelete(
    filter: Partial<SessionEntity>
  ): Promise<SessionEntity | null>;
}
