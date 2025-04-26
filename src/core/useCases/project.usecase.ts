import mongoose, { Types } from 'mongoose';
import { ProjectEntity } from '../entities/project.entity';
import { ProjectInterface } from '../interfaces/project.interface';
import { ForbiddenError, NotFoundError } from '../../utils/error';
import { IS3Service } from '../../infrastructure/services/s3/interface/IS3Service';
import { DesignInterface } from '../interfaces/design.interface';
import { DesignEntity } from '../entities/design.entity';

export class ProjectUseCase {
  constructor(
    private projectRepository: ProjectInterface,
    private s3Service: IS3Service,
    private designRepository: DesignInterface
  ) {}

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
    const newProject = await this.projectRepository.create(projectData);

    const projectId = newProject._id as string;

    const uploadRes = await this.s3Service.createEmptyProjectDesign(projectId);

    const designData: Partial<DesignEntity> = {
      projectId: newProject._id as mongoose.Types.ObjectId,
      filePath: uploadRes.filePath,
      contentType: uploadRes.contentType
    };

    await this.designRepository.create(designData);

    return newProject;
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

  async getProjectDesign(projectId: string) {
    const projectDesign =
      await this.designRepository.getDesignByProjectId(projectId);

    if (!projectDesign) {
      throw new NotFoundError('Project design not found');
    }

    const file = await this.s3Service.getProjectDesign(projectDesign.filePath);
    // file data format is { Nodes: [], Edges: []}

    if (!file) {
      throw new NotFoundError('Project design not found');
    }

    return file;
  }

  async getProjectAssociatedTeamsAndMembers(
    projectId: string
  ): Promise<ProjectEntity[]> {
    const project = await this.projectRepository.findProjectById(projectId);

    if (!project) {
      throw new NotFoundError('Project not found');
    }

    const teams =
      await this.projectRepository.findProjectAssociatedTeams(projectId);

    return teams;
  }

  async addTeamToProject(
    teamIds: string[],
    projectId: string
  ): Promise<ProjectEntity> {
    const updateProject = await this.projectRepository.addTeamToProject(
      projectId,
      teamIds
    );

    if (!updateProject) {
      throw new NotFoundError('Project not found');
    }

    return updateProject;
  }

  async removeTeamFromProject(
    projectId: string,
    teamId: string
  ): Promise<ProjectEntity> {
    const updateProject = await this.projectRepository.removeTeamFromProject(
      projectId,
      teamId
    );

    if (!updateProject) {
      throw new NotFoundError('Project not found');
    }

    return updateProject;
  }

  async getProjectDetails(projectId: string): Promise<ProjectEntity> {
    const project = await this.projectRepository.findProjectById(projectId);

    if (!project) {
      throw new NotFoundError('Project not found');
    }

    return project;
  }
}
