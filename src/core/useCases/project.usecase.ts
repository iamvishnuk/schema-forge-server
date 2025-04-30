import mongoose, { Types } from 'mongoose';
import { ProjectEntity } from '../entities/project.entity';
import { ProjectInterface } from '../interfaces/project.interface';
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError
} from '../../utils/error';
import { IS3Service } from '../../infrastructure/services/s3/interface/IS3Service';
import { DesignInterface } from '../interfaces/design.interface';
import { DesignEntity } from '../entities/design.entity';
import { ProjectMemberInterface } from '../interfaces/IProjectMember';
import {
  ProjectMemberEntity,
  ProjectMemberRoleEnum
} from '../entities/project-member.entity';
import { IEmailService } from '../../infrastructure/services/email/interface/IEmailService';
import { projectInvitationTemplate } from '../../infrastructure/services/email/templates/template';
import { config } from '../../config/env';

export class ProjectUseCase {
  constructor(
    private projectRepository: ProjectInterface,
    private s3Service: IS3Service,
    private designRepository: DesignInterface,
    private projectMemberRepository: ProjectMemberInterface,
    private emailService: IEmailService
  ) {}

  async createProject(
    data: Partial<ProjectEntity>,
    userId: string
  ): Promise<ProjectEntity> {
    const projectData: Partial<ProjectEntity> = {
      name: data.name,
      description: data.description,
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
    const [userOwnedProject, userAccessibleProject] = await Promise.all([
      this.projectRepository.getProjects(userId),
      this.projectMemberRepository.getProjectByUserId(userId)
    ]);

    const allProject = [
      ...userOwnedProject,
      ...userAccessibleProject.map((project) => project.projectId)
    ];

    return allProject as ProjectEntity[];
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

  async getProjectDetails(projectId: string): Promise<ProjectEntity> {
    const project = await this.projectRepository.findProjectById(projectId);

    if (!project) {
      throw new NotFoundError('Project not found');
    }

    return project;
  }

  async getProjectMembers(projectId: string) {
    const project = await this.projectRepository.findProjectById(projectId);

    if (!project) {
      throw new NotFoundError('Project not found');
    }

    return {
      project: project,
      member: []
    };
  }

  async acceptProjectInvite(
    token: string,
    userId: string
  ): Promise<ProjectMemberEntity> {
    const project = await this.projectRepository.findProjectByToken(token);

    if (!project) {
      throw new NotFoundError('Project not found');
    }

    const isExistingMember =
      await this.projectMemberRepository.findByProjectIdAndUserId(
        project._id as string,
        userId
      );

    if (isExistingMember) {
      return isExistingMember;
    }

    const member = this.projectMemberRepository.create({
      userId: userId as unknown as mongoose.Types.ObjectId,
      projectId: project._id as unknown as mongoose.Types.ObjectId
    });

    if (!member) {
      throw new BadRequestError('Failed to accept project invite');
    }

    return member;
  }

  async sendProjectInvite(
    projectId: string,
    emails: string[],
    userName: string
  ) {
    const project = await this.projectRepository.findProjectById(projectId);

    if (!project) {
      throw new NotFoundError('Project not found');
    }

    const INVITE_URL = `${config.APP_ORIGIN}/project/invite/${project.inviteToken}`;

    await Promise.all(
      emails.map((email) =>
        this.emailService.sendEmail({
          to: email,
          ...projectInvitationTemplate(
            INVITE_URL,
            project.name,
            userName,
            ProjectMemberRoleEnum.VIEWER
          )
        })
      )
    );

    return {
      message: `Invitations sent to ${emails.length} recipients`
    };
  }
}
