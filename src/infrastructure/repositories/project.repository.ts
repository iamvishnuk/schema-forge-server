import { ProjectEntity } from '../../core/entities/project.entity';
import { ProjectInterface } from '../../core/interfaces/project.interface';
import { ProjectModel } from '../models/project.model';

export class ProjectRepositoryImpl implements ProjectInterface {
  create(data: Partial<ProjectEntity>): Promise<ProjectEntity> {
    return ProjectModel.create(data);
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
