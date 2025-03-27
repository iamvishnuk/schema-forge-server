import mongoose from 'mongoose';
import { TeamEntity } from '../entities/teams.entity';

export interface TeamRepository {
  create(data: Partial<TeamEntity>): Promise<TeamEntity>;
  countUserTeams(userId: mongoose.Types.ObjectId): Promise<number>;
  getAllUserTeams(userId: mongoose.Types.ObjectId): Promise<TeamEntity[]>;
  findTeamById(teamId: mongoose.Types.ObjectId): Promise<TeamEntity | null>;
  updateTeam(
    teamId: mongoose.Types.ObjectId,
    data: Partial<TeamEntity>
  ): Promise<TeamEntity | null>;
  findByIdAndDelete(id: string): Promise<TeamEntity | null>;
}
