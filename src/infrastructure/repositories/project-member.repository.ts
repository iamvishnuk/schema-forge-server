import { ProjectMemberEntity } from '../../core/entities/project-member.entity';
import { ProjectMemberInterface } from '../../core/interfaces/IProjectMember';
import { ProjectMemberModel } from '../models/project-member.model';
import { Types } from 'mongoose';

export class ProjectMemberRepositoryImpl implements ProjectMemberInterface {
  getAllProjectMembers(projectId: string): Promise<ProjectMemberEntity[]> {
    return ProjectMemberModel.aggregate([
      { $match: { projectId: new Types.ObjectId(projectId) } },
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
  create(data: Partial<ProjectMemberEntity>): Promise<ProjectMemberEntity> {
    return ProjectMemberModel.create(data);
  }

  findByProjectIdAndUserId(
    projectId: string,
    userId: string
  ): Promise<ProjectMemberEntity | null> {
    return ProjectMemberModel.findOne({ projectId: projectId, userId });
  }

  getProjectByUserId(userId: string): Promise<ProjectMemberEntity[]> {
    return ProjectMemberModel.aggregate([
      { $match: { userId } },
      {
        $lookup: {
          from: 'projects',
          localField: 'projectId',
          foreignField: '_id',
          as: 'projectId'
        }
      },
      { $set: { projectId: { $arrayElemAt: ['$projectId', 0] } } }
    ]);
  }

  getAllUserProjects(userId: string): Promise<ProjectMemberEntity[]> {
    return ProjectMemberModel.aggregate([
      { $match: { userId } },
      {
        $lookup: {
          from: 'projects',
          localField: 'projectId',
          foreignField: '_id',
          as: 'projectId'
        }
      },
      { $unwind: { path: '$projectId', preserveNullAndEmptyArrays: false } },
      {
        $lookup: {
          from: 'project_members',
          localField: 'projectId._id',
          foreignField: 'projectId',
          as: 'members'
        }
      },
      {
        $group: {
          _id: '$projectId._id',
          name: { $first: '$projectId.name' },
          description: { $first: '$projectId.description' },
          databaseType: { $first: '$projectId.databaseType' },
          memberCount: { $sum: { $size: '$members' } },
          createdAt: { $first: '$projectId.createdAt' },
          createdBy: { $first: '$projectId.createdBy' }
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          databaseType: 1,
          memberCount: 1,
          createdAt: 1,
          createdBy: 1
        }
      }
    ]);
  }

  changeRole(id: string, role: string): Promise<ProjectMemberEntity | null> {
    return ProjectMemberModel.findByIdAndUpdate(id, { role }, { new: true });
  }

  getProjectMemberById(id: string): Promise<ProjectMemberEntity | null> {
    return ProjectMemberModel.findById(id);
  }

  deleteProjectMemberById(id: string): Promise<ProjectMemberEntity | null> {
    return ProjectMemberModel.findByIdAndDelete(id);
  }
}
