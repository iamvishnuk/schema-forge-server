import mongoose, { Types } from 'mongoose';
import {
  ITeamWithDetails,
  ITeamWithMembers,
  TeamEntity
} from '../../core/entities/teams.entity';
import { TeamRepository } from '../../core/interfaces/team.repository';
import { TeamModel } from '../models/team.model';
import { Aggregate } from 'mongoose';
import { TeamMemberModel } from '../models/team-member.model';
import {
  MemberStatusEnum,
  TeamRoleEnum
} from '../../core/entities/team-member.entity';

export class TeamsRepositoryImpl implements TeamRepository {
  async create(data: Partial<TeamEntity>): Promise<TeamEntity> {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const team = await TeamModel.create([data], { session }).then(
        (teams) => teams[0]
      );
      const member = await TeamMemberModel.create({
        userId: data?.createdBy,
        teamId: team._id,
        role: TeamRoleEnum.OWNER,
        status: MemberStatusEnum.ACTIVE
      });

      if (!team || !member) {
        throw new Error('Failed to create team or member');
      }
      await session.commitTransaction();
      return team;
    } catch (error) {
      await session.abortTransaction();
      throw error instanceof Error ? error : new Error('Failed to create team');
    } finally {
      session.endSession();
    }
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

  async findTeamByIdWithMembers(
    teamId: string
  ): Promise<Aggregate<ITeamWithMembers> | null> {
    const result = await TeamModel.aggregate<ITeamWithMembers>([
      { $match: { _id: new Types.ObjectId(teamId) } },
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

  addMemberToTeam(
    teamId: string,
    userId: string,
    role: string
  ): Promise<TeamEntity | null> {
    return TeamModel.findByIdAndUpdate(
      teamId,
      {
        $addToSet: {
          members: {
            userId: new Types.ObjectId(userId),
            role
          }
        }
      },
      { new: true }
    );
  }
}
