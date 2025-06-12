import mongoose from 'mongoose';
import { ProjectEntity } from '../../core/entities/project.entity';
import { ProjectInterface } from '../../core/interfaces/project.interface';
import { ProjectModel } from '../models/project.model';
import { ProjectMemberModel } from '../models/project-member.model';
import { ProjectMemberRoleEnum } from '../../core/entities/project-member.entity';

export class ProjectRepositoryImpl implements ProjectInterface {
  async create(data: Partial<ProjectEntity>): Promise<ProjectEntity> {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const project = await ProjectModel.create([data], { session }).then(
        (p) => p[0]
      );

      const projectMember = await ProjectMemberModel.create({
        userId: data?.createdBy,
        projectId: project._id,
        role: ProjectMemberRoleEnum.OWNER
      });

      if (!project || !projectMember) {
        throw new Error('Failed to create project or member');
      }
      await session.commitTransaction();
      return project;
    } catch (error) {
      await session.abortTransaction();
      throw error instanceof Error
        ? error
        : new Error('Failed to create project');
    } finally {
      session.endSession();
    }
  }

  getProjects(userId: string): Promise<ProjectEntity[]> {
    return ProjectModel.find({ createdBy: userId });
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

  findProjectByToken(token: string): Promise<ProjectEntity | null> {
    return ProjectModel.findOne({ inviteToken: token });
  }
}
