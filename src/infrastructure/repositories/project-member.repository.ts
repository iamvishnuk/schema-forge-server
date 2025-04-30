import { ProjectMemberEntity } from '../../core/entities/project-member.entity';
import { ProjectMemberInterface } from '../../core/interfaces/IProjectMember';
import { ProjectMemberModel } from '../models/project-member.model';

export class ProjectMemberRepositoryImpl implements ProjectMemberInterface {
  getAllProjectMembers(projectId: string): Promise<ProjectMemberEntity[]> {
    return ProjectMemberModel.find({ projectId }).populate('userId');
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
}
