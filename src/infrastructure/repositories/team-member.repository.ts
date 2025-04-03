import { Types } from 'mongoose';
import {
  TeamMemberEntity,
  TeamMemberWithUser
} from '../../core/entities/team-member.entity';
import { TeamMemberInterface } from '../../core/interfaces/team-member.interface';
import { IGetUserTeams } from '../../definitions/interface';
import { TeamMemberModel } from '../models/team-member.model';

export class TeamMemberRepositoryImpl implements TeamMemberInterface {
  create(data: Partial<TeamMemberEntity>): Promise<TeamMemberEntity> {
    return TeamMemberModel.create(data);
  }

  async getAllUserTeams(userId: string): Promise<IGetUserTeams[]> {
    const teams = await TeamMemberModel.aggregate([
      { $match: { userId } },
      {
        $lookup: {
          from: 'teams',
          localField: 'teamId',
          foreignField: '_id',
          as: 'team'
        }
      },
      { $unwind: { path: '$team', preserveNullAndEmptyArrays: false } },
      {
        $lookup: {
          from: 'team_members',
          localField: 'team._id',
          foreignField: 'teamId',
          as: 'members'
        }
      },
      {
        $group: {
          _id: '$team._id',
          name: { $first: '$team.name' },
          description: { $first: '$team.description' },
          memberCount: { $sum: { $size: '$members' } },
          createdAt: { $first: '$team.createdAt' },
          createdBy: { $first: '$team.createdBy' }
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          memberCount: 1,
          createdAt: 1,
          createdBy: 1
        }
      }
    ]);
    return teams;
  }

  getAllTeamMembers(teamId: string): Promise<TeamMemberWithUser[]> {
    return TeamMemberModel.aggregate([
      { $match: { teamId: new Types.ObjectId(teamId) } },
      {
        $lookup: {
          from: 'users',
          let: { userId: '$userId' },
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$userId'] } } },
            { $project: { name: 1, email: 1 } }
          ],
          as: 'userId'
        }
      },
      { $set: { userId: { $arrayElemAt: ['$userId', 0] } } }
    ]);
  }
}
