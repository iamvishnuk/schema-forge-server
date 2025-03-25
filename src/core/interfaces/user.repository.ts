import mongoose from 'mongoose';
import { UserEntity } from '../entities/user.entity';

// user repository interface
export interface UserRepository {
  create(
    user: Pick<UserEntity, 'name' | 'email' | 'password'>
  ): Promise<UserEntity>;
  findByEmail(email: string): Promise<UserEntity | null>;
  findByIdAndUpdate(
    id: mongoose.Types.ObjectId,
    user: Partial<UserEntity>
  ): Promise<UserEntity | null>;
  findById(id: string): Promise<UserEntity | null>;
}
