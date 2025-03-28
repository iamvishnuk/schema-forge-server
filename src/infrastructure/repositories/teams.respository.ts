import { Types } from 'mongoose';
import { ITeamWithDetails, TeamEntity } from '../../core/entities/teams.entity';
import { TeamRepository } from '../../core/interfaces/team.repository';
import { TeamModel } from '../models/team.model';
import { Aggregate } from 'mongoose';

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
  async getTeamById(
    teamId: string,
    userId: string
  ): Promise<Aggregate<ITeamWithDetails> | null> {
    const result = await TeamModel.aggregate<ITeamWithDetails>([
      {
        $match: {
          _id: new Types.ObjectId(teamId),
          $and: [
            {
              $or: [
                { createdBy: new Types.ObjectId(userId) },
                { 'members.userId': new Types.ObjectId(userId) }
              ]
            }
          ]
        }
      },
      {
        $lookup: {
          from: 'users',
          let: { createdBy: '$createdBy' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$_id', { $toObjectId: '$$createdBy' }] }
              }
            },
            { $project: { name: 1, email: 1 } }
          ],
          as: 'createdBy'
        }
      },
      { $set: { createdBy: { $arrayElemAt: ['$createdBy', 0] } } },
      { $unwind: { path: '$members', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'users',
          let: { userId: '$members.userId' },
          pipeline: [
            {
              $match: { $expr: { $eq: ['$_id', { $toObjectId: '$$userId' }] } }
            },
            { $project: { name: 1, email: 1 } }
          ],
          as: 'members.userId'
        }
      },
      { $set: { 'members.userId': { $arrayElemAt: ['$members.userId', 0] } } },
      {
        $group: {
          _id: '$_id',
          name: { $first: '$name' },
          description: { $first: '$description' },
          createdBy: { $first: '$createdBy' },
          members: { $push: '$members' },
          projects: { $first: '$projects' },
          createdAt: { $first: '$createdAt' },
          updatedAt: { $first: '$updatedAt' }
        }
      }
    ]).exec();
    return result[0] ?? null;
  }
}
