import { UserEntity } from '../../core/entities/user.entity';
import { UserRepository } from '../../core/interfaces/user.repository';
import { UserModel } from '../models/user.model';

export class UserRepositoryImpl implements UserRepository {
  async create(
    user: Pick<UserEntity, 'name' | 'email' | 'password'>
  ): Promise<UserEntity> {
    return UserModel.create(user);
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return UserModel.findOne({ email });
  }

  async findByIdAndUpdate(
    id: string,
    data: Partial<UserEntity>
  ): Promise<UserEntity | null> {
    return UserModel.findByIdAndUpdate(id, data, { new: true });
  }

  async findById(id: string): Promise<UserEntity | null> {
    return UserModel.findById(id);
  }
}
