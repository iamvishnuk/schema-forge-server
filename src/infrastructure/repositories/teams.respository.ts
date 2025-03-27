import { Types } from 'mongoose';
import { TeamEntity } from '../../core/entities/teams.entity';
import { TeamRepository } from '../../core/interfaces/team.repository';
import { TeamModel } from '../models/team.model';

export class TeamsRepositoryImpl implements TeamRepository {
  create(data: Partial<TeamEntity>): Promise<TeamEntity> {
    return TeamModel.create(data);
  }
  countUserTeams(userId: Types.ObjectId): Promise<number> {
    return TeamModel.countDocuments({ createdBy: userId });
  }
  getAllUserTeams(userId: Types.ObjectId): Promise<TeamEntity[]> {
    return TeamModel.find({
      $or: [{ createdBy: userId }, { 'members.userId': userId }]
    });
  }
  findTeamById(teamId: Types.ObjectId): Promise<TeamEntity | null> {
    return TeamModel.findById(teamId);
  }
  updateTeam(
    teamId: Types.ObjectId,
    data: Partial<TeamEntity>
  ): Promise<TeamEntity | null> {
    return TeamModel.findByIdAndUpdate(teamId, data, { new: true });
  }
  findByIdAndDelete(id: string): Promise<TeamEntity | null> {
    return TeamModel.findByIdAndDelete(id);
  }
}
