import { Types } from 'mongoose';
import { ProjectEntity } from '../entities/project.entity';
import { ProjectInterface } from '../interfaces/project.interface';
import { ForbiddenError, NotFoundError } from '../../utils/error';

export class ProjectUseCase {
  constructor(private projectRepository: ProjectInterface) {}

  async createTeam(
    data: Partial<ProjectEntity>,
    userId: string
  ): Promise<ProjectEntity> {
    const projectData: Partial<ProjectEntity> = {
      name: data.name,
      description: data.description,
      teamIds: data.teamIds,
      databaseType: data.databaseType,
      tag: data.tag,
      connectionString: data.connectionString,
      createdBy: new Types.ObjectId(userId)
    };
    return this.projectRepository.create(projectData);
  }

  async getProjects(userId: string): Promise<ProjectEntity[]> {
    return await this.projectRepository.getProjects(userId);
  }

  async updateProject(
    id: string,
    data: Partial<ProjectEntity>,
    userId: string
  ): Promise<ProjectEntity> {
    const project = await this.projectRepository.findProjectById(id);

    if (!project) {
      throw new NotFoundError('Project not found');
    }

    if (project.createdBy.toString() !== userId.toString()) {
      throw new ForbiddenError('You are not authorized to update this project');
    }

    const projectData: Partial<ProjectEntity> = {
      name: data.name,
      description: data.description,
      teamIds: data.teamIds,
      databaseType: data.databaseType,
      tag: data.tag,
      connectionString: data.connectionString
    };

    const updatedProject = await this.projectRepository.findByIdAndUpdate(
      id,
      projectData
    );

    if (!updatedProject) {
      throw new NotFoundError('Project not found');
    }

    return updatedProject;
  }

  async deleteProject(id: string, userId: string): Promise<ProjectEntity> {
    const project = await this.projectRepository.findProjectById(id);

    if (!project) {
      throw new NotFoundError('Project not found');
    }

    if (project.createdBy.toString() !== userId.toString()) {
      throw new ForbiddenError('You are not authorized to delete this project');
    }

    const deletedProject = await this.projectRepository.deleteProjectById(id);

    if (!deletedProject) {
      throw new NotFoundError('Project not found');
    }

    return deletedProject;
  }
}
