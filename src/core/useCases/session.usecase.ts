import mongoose from 'mongoose';
import { NotFoundError } from '../../utils/error';
import { SessionEntity } from '../entities/session.entity';
import { UserEntity } from '../entities/user.entity';
import { SessionRepository } from '../interfaces/session.repository';

export class SessionUseCase {
  constructor(private sessionRepository: SessionRepository) {}

  /**
   * Retrieves all sessions for a specific user.
   *
   * @param userid - The unique identifier of the user whose sessions are to be retrieved.
   * @returns A promise that resolves to an array of SessionEntity objects.
   */
  async getAllSession(userid: string): Promise<SessionEntity[]> {
    return await this.sessionRepository.getAllSession(userid);
  }

  /**
   * Retrieves the user associated with the current active session.
   *
   * @param sessionId - The unique identifier of the session to look up
   * @returns A Promise that resolves to the UserEntity associated with the session
   * @throws {NotFoundError} When the specified session does not exist
   */
  async getCurrentSession(sessionId: string): Promise<UserEntity | null> {
    const session =
      await this.sessionRepository.findCurrentSessionById(sessionId);

    if (!session) {
      throw new NotFoundError('Session not found');
    }
    const user = session.userId;

    return user;
  }

  /**
   * Deletes a session for a specified user.
   *
   * @param sessionId - The ID of the session to delete
   * @param userId - The MongoDB ObjectId of the user who owns the session
   * @throws {NotFoundError} - If the session does not exist or doesn't belong to the user
   * @returns {Promise<void>} - A promise that resolves when the session is successfully deleted
   */
  async deleteSession(
    sessionId: string,
    userId: mongoose.Types.ObjectId
  ): Promise<void> {
    const session = await this.sessionRepository.findOneAndDelete({
      _id: sessionId,
      userId
    });

    if (!session) {
      throw new NotFoundError('Session not found');
    }

    return;
  }
}
