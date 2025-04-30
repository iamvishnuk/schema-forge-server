import { Request, Response } from 'express';
import { ProjectUseCase } from '../../core/useCases/project.usecase';
import { ProjectRepositoryImpl } from '../../infrastructure/repositories/project.repository';
import { asyncHandler } from '../../utils/asyncHandler';
import { ResponseHandler } from '../../utils/responseHandler';
import { HTTPSTATUS } from '../../config/http.config';
import { S3Service } from '../../infrastructure/services/s3/services/S3Service';
import { DesignRepositoryImpl } from '../../infrastructure/repositories/design.repository';
import { ProjectMemberRepositoryImpl } from '../../infrastructure/repositories/project-member.repository';
import { NodemailerService } from '../../infrastructure/services/email/services/NodemailerService';

export class ProjectController {
  private projectRepository: ProjectRepositoryImpl;
  private designRepository: DesignRepositoryImpl;
  private projectUseCase: ProjectUseCase;
  private s3Service: S3Service;
  private projectMemberRepository: ProjectMemberRepositoryImpl;
  private emailService: NodemailerService;

  constructor() {
    this.projectRepository = new ProjectRepositoryImpl();
    this.designRepository = new DesignRepositoryImpl();
    this.s3Service = new S3Service();
    this.projectMemberRepository = new ProjectMemberRepositoryImpl();
    this.emailService = new NodemailerService();
    this.projectUseCase = new ProjectUseCase(
      this.projectRepository,
      this.s3Service,
      this.designRepository,
      this.projectMemberRepository,
      this.emailService
    );
  }

  public createProject = asyncHandler(async (req: Request, res: Response) => {
    const userId = req?.user?._id as string;
    const data = req.body;
    const project = await this.projectUseCase.createProject(data, userId);

    ResponseHandler.success(
      res,
      project,
      HTTPSTATUS.CREATED,
      'Project created successfully'
    );
  });

  public getProjects = asyncHandler(async (req: Request, res: Response) => {
    const userId = req?.user?._id as string;
    const projects = await this.projectUseCase.getProjects(userId);

    ResponseHandler.success(
      res,
      projects,
      HTTPSTATUS.OK,
      'Projects retrieved successfully'
    );
  });

  public updateProject = asyncHandler(async (req: Request, res: Response) => {
    const projectId = req.params.id;
    const data = req.body;
    const userId = req?.user?._id as string;

    const updatedProject = await this.projectUseCase.updateProject(
      projectId,
      data,
      userId
    );

    ResponseHandler.success(
      res,
      updatedProject,
      HTTPSTATUS.OK,
      'Project updated successfully'
    );
  });

  public deleteProject = asyncHandler(async (req: Request, res: Response) => {
    const projectId = req.params.id;
    const userId = req?.user?._id as string;

    const deletedProject = await this.projectUseCase.deleteProject(
      projectId,
      userId
    );

    ResponseHandler.success(
      res,
      deletedProject,
      HTTPSTATUS.OK,
      'Project deleted successfully'
    );
  });

  public getProjectDesign = asyncHandler(
    async (req: Request, res: Response) => {
      const projectId = req.params.id;

      const design = await this.projectUseCase.getProjectDesign(projectId);

      ResponseHandler.success(
        res,
        design,
        HTTPSTATUS.OK,
        'Project design retrieved successfully'
      );
    }
  );

  public getProjectDetails = asyncHandler(
    async (req: Request, res: Response) => {
      const projectId = req.params.id;

      const project = await this.projectUseCase.getProjectDetails(projectId);

      ResponseHandler.success(
        res,
        project,
        HTTPSTATUS.OK,
        'Project details retrieved successfully'
      );
    }
  );

  public getProjectMembers = asyncHandler(
    async (req: Request, res: Response) => {
      const projectId = req.params.id;

      const { project, member } =
        await this.projectUseCase.getProjectMembers(projectId);

      ResponseHandler.success(
        res,
        {
          project,
          member
        },
        HTTPSTATUS.OK,
        'Project members retrieved successfully'
      );
    }
  );

  public acceptProjectInvite = asyncHandler(
    async (req: Request, res: Response) => {
      const token = req.body.token;
      const userId = req?.user?._id as string;

      const projectMember = await this.projectUseCase.acceptProjectInvite(
        token,
        userId
      );

      ResponseHandler.success(
        res,
        projectMember,
        HTTPSTATUS.OK,
        'Project invite accepted successfully'
      );
    }
  );

  public sendProjectInvitation = asyncHandler(
    async (req: Request, res: Response) => {
      const emails = req.body.emails;
      const projectId = req.body.projectId;
      const userName = req.user?.name as string;

      const { message } = await this.projectUseCase.sendProjectInvite(
        projectId,
        emails,
        userName
      );

      ResponseHandler.success(res, {}, HTTPSTATUS.OK, message);
    }
  );
}
