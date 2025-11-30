import mongoose, { Types } from 'mongoose';
import { ProjectEntity, ProjectTemplateEnum } from '../entities/project.entity';
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
import { ITemplateService } from '../../infrastructure/services/template/interface/ITemplateService';
import { IEdge, INode } from '../../definitions/interface';
import { generateMongooseCode } from '../../utils/code/mongoose';
import { TOrm } from '../../definitions/type';
import { generatePrismaCodeForMongoDB } from '../../utils/code/prisma';

export class ProjectUseCase {
  constructor(
    private projectRepository: ProjectInterface,
    private s3Service: IS3Service,
    private designRepository: DesignInterface,
    private projectMemberRepository: ProjectMemberInterface,
    private emailService: IEmailService,
    private templateService?: ITemplateService
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
      templateType: data.templateType || ProjectTemplateEnum.NONE,
      createdBy: new Types.ObjectId(userId)
    };
    const newProject = await this.projectRepository.create(projectData);

    const projectId = newProject._id as string;

    // Get the appropriate design template or use empty design
    let designTemplate: Record<string, unknown> = { Nodes: [], Edges: [] };

    // If template is specified and template service exists, get template design
    if (
      this.templateService &&
      projectData.templateType &&
      projectData.templateType !== ProjectTemplateEnum.NONE
    ) {
      try {
        designTemplate = await this.templateService.getTemplateDesign(
          projectData.templateType
        );
      } catch {
        // If template retrieval fails, fall back to empty design
        designTemplate = { Nodes: [], Edges: [] };
      }
    }

    // Upload the template or empty design to S3
    const uploadRes = await this.s3Service.updateProjectDesign(
      designTemplate,
      `design/${projectId}/${projectId}-design.json`
    );

    const designData: Partial<DesignEntity> = {
      projectId: newProject._id as mongoose.Types.ObjectId,
      filePath: uploadRes.filePath,
      contentType: uploadRes.contentType
    };

    await this.designRepository.create(designData);

    return newProject;
  }

  async getProjects(userId: string) {
    return this.projectMemberRepository.getAllUserProjects(userId);
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

  async getProjectMembers(projectId: string, userId: string) {
    const project = await this.projectRepository.findProjectById(projectId);
    const members =
      await this.projectMemberRepository.getAllProjectMembers(projectId);

    const isMember = members.some(
      (member) => member.userId._id.toString() === userId.toString()
    );

    if (!isMember) {
      throw new ForbiddenError('You are not a member of this project');
    }

    if (!project) {
      throw new NotFoundError('Project not found');
    }

    return {
      project: project,
      members: members
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

  async changeProjectMemberRole(
    id: string,
    role: string
  ): Promise<ProjectMemberEntity> {
    const projectMember = await this.projectMemberRepository.changeRole(
      id,
      role
    );

    if (!projectMember) {
      throw new NotFoundError('Project member not found');
    }

    return projectMember;
  }

  async removeOrLeaveProject(
    id: string,
    userId: string
  ): Promise<{ message: string; isSelf: boolean }> {
    const projectMember =
      await this.projectMemberRepository.getProjectMemberById(id);

    if (!projectMember) {
      throw new NotFoundError(
        'You are not a member of this project or cannot remove the user'
      );
    }

    const isOwner = projectMember.role === ProjectMemberRoleEnum.OWNER;
    if (isOwner) {
      throw new ForbiddenError('You cannot remove the owner of the project');
    }

    const isSelf = projectMember.userId.toString() === userId.toString();

    const deletedMember =
      await this.projectMemberRepository.deleteProjectMemberById(id);

    if (!deletedMember) {
      throw new NotFoundError(
        isSelf
          ? 'Failed to leave the project'
          : 'Failed to remove the user from the project'
      );
    }

    return {
      message: isSelf
        ? 'You have successfully left the project'
        : 'User has been removed from the project',
      isSelf
    };
  }

  async getProjectTablesOrCollections(projectId: string) {
    const project = await this.projectRepository.findProjectById(projectId);

    if (!project) {
      throw new NotFoundError('Project not found');
    }

    const filePath = `design/${projectId}/${projectId}-design.json`;

    const file = (await this.s3Service.getProjectDesign(filePath)) as {
      Nodes: INode[];
      Edges: IEdge[];
    };

    const collection = file.Nodes.map((node) => {
      return {
        id: node.id,
        label: node.data.label
      };
    });

    return collection;
  }

  async getSelectedTableOrCollection(projectId: string, nodeId: string) {
    const project = await this.projectRepository.findProjectById(projectId);

    if (!project) {
      throw new NotFoundError('Project not found');
    }

    const filePath = `design/${projectId}/${projectId}-design.json`;

    const file = (await this.s3Service.getProjectDesign(filePath)) as {
      Nodes: INode[];
      Edges: IEdge[];
    };

    const selectedNode = file.Nodes.find((node) => node.id === nodeId);

    return selectedNode || null;
  }

  async generateCode(nodeId: string, ormType: TOrm, projectId: string) {
    const project = await this.projectRepository.findProjectById(projectId);

    if (!project) {
      throw new NotFoundError('Project Not found');
    }

    const filePath = `design/${projectId}/${projectId}-design.json`;

    const file = (await this.s3Service.getProjectDesign(filePath)) as {
      Nodes: INode[];
      Edges: IEdge[];
    };

    const selectedNode = file.Nodes.find((node) => node.id === nodeId);

    if (!selectedNode) {
      throw new NotFoundError('Selected Node not found');
    }

    let generatedCode;

    if (ormType === 'mongoose') {
      generatedCode = generateMongooseCode(selectedNode);
    } else if (ormType === 'prisma') {
      generatedCode = generatePrismaCodeForMongoDB(selectedNode);
    } else {
      generatedCode = '';
    }

    return generatedCode;
  }
}
