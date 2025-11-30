import mongoose, { Aggregate } from 'mongoose';
import {
  ITeamWithDetails,
  ITeamWithMembers,
  TeamEntity
} from '../entities/teams.entity';

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
  getTeamById(
    teamId: string,
    userId: string
  ): Promise<Aggregate<ITeamWithDetails> | null>;
  findTeamByIdWithMembers(
    teamId: string
  ): Promise<Aggregate<ITeamWithMembers> | null>;
  addMemberToTeam(
    teamId: string,
    userId: string,
    role: string
  ): Promise<TeamEntity | null>;
  findUserCreatedTeams(userId: string): Promise<TeamEntity[]>;
}
