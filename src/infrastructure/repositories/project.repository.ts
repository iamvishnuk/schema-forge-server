import { Types } from 'mongoose';
import { ProjectEntity } from '../../core/entities/project.entity';
import { ProjectInterface } from '../../core/interfaces/project.interface';
import { ProjectModel } from '../models/project.model';

export class ProjectRepositoryImpl implements ProjectInterface {
  create(data: Partial<ProjectEntity>): Promise<ProjectEntity> {
    return ProjectModel.create(data);
  }

  getProjects(userId: string): Promise<ProjectEntity[]> {
    return ProjectModel.aggregate([
      { $unwind: { path: '$teamIds', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'team_members',
          let: { team: '$teamIds' },
          pipeline: [
            {
              $match: { $expr: { $eq: ['$teamId', { $toObjectId: '$$team' }] } }
            }
          ],
          as: 'teamMembers'
        }
      },
      { $unwind: { path: '$teamMembers', preserveNullAndEmptyArrays: true } },
      {
        $match: {
          $or: [
            { createdBy: new Types.ObjectId(userId) },
            { 'teamMembers.userId': new Types.ObjectId(userId) }
          ]
        }
      },
      { $project: { teamMembers: 0 } },
      {
        $group: {
          _id: '$_id',
          name: { $first: '$name' },
          description: { $first: '$description' },
          teamIds: { $addToSet: '$teamIds' },
          databaseType: { $first: '$databaseType' },
          tag: { $first: '$tag' },
          connectionString: { $first: '$connectionString' },
          createdBy: { $first: '$createdBy' },
          createdAt: { $first: '$createdAt' },
          updatedAt: { $first: '$updatedAt' }
        }
      }
    ]);
  }

  findByIdAndUpdate(
    id: string,
    data: Partial<ProjectEntity>
  ): Promise<ProjectEntity | null> {
    return ProjectModel.findByIdAndUpdate(id, data, { new: true });
  }

  findProjectById(id: string): Promise<ProjectEntity | null> {
    return ProjectModel.findById(id);
  }

  deleteProjectById(id: string): Promise<ProjectEntity | null> {
    return ProjectModel.findByIdAndDelete(id);
  }

  findProjectAssociatedTeams(id: string): Promise<ProjectEntity[]> {
    return ProjectModel.aggregate([
      { $match: { _id: new Types.ObjectId(id) } },
      { $unwind: { path: '$teamIds', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'teams',
          let: { teamId: '$teamIds' },
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$teamId'] } } },
            { $project: { name: 1 } }
          ],
          as: 'teamIds'
        }
      },
      { $set: { teamIds: { $arrayElemAt: ['$teamIds', 0] } } },
      {
        $group: {
          _id: '$_id',
          name: { $first: '$name' },
          description: { $first: '$description' },
          teamIds: { $addToSet: '$teamIds' },
          databaseType: { $first: '$databaseType' },
          tag: { $first: '$tag' },
          connectionString: { $first: '$connectionString' },
          createdBy: { $first: '$createdBy' },
          createdAt: { $first: '$createdAt' },
          updatedAt: { $first: '$updatedAt' }
        }
      }
    ]);
  }

  addTeamToProject(
    projectId: string,
    teamIds: string[]
  ): Promise<ProjectEntity | null> {
    return ProjectModel.findByIdAndUpdate(
      projectId,
      { $addToSet: { teamIds: { $each: teamIds } } },
      { new: true }
    );
  }

  removeTeamFromProject(
    projectId: string,
    teamIds: string
  ): Promise<ProjectEntity | null> {
    return ProjectModel.findByIdAndUpdate(
      projectId,
      { $pull: { teamIds: teamIds } },
      { new: true }
    );
  }
}
