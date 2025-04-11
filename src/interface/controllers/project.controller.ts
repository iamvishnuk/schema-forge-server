import { Request, Response } from 'express';
import { ProjectUseCase } from '../../core/useCases/project.usecase';
import { ProjectRepositoryImpl } from '../../infrastructure/repositories/project.repository';
import { asyncHandler } from '../../utils/asyncHandler';
import { ResponseHandler } from '../../utils/responseHandler';
import { HTTPSTATUS } from '../../config/http.config';
import { S3Service } from '../../infrastructure/services/s3/services/S3Service';
import { DesignRepositoryImpl } from '../../infrastructure/repositories/design.repository';

export class ProjectController {
  private projectRepository: ProjectRepositoryImpl;
  private designRepository: DesignRepositoryImpl;
  private projectUseCase: ProjectUseCase;
  private s3Service: S3Service;

  constructor() {
    this.projectRepository = new ProjectRepositoryImpl();
    this.designRepository = new DesignRepositoryImpl();
    this.s3Service = new S3Service();
    this.projectUseCase = new ProjectUseCase(
      this.projectRepository,
      this.s3Service,
      this.designRepository
    );
  }

  public createProject = asyncHandler(async (req: Request, res: Response) => {
    const userId = req?.user?._id as string;
    const data = req.body;
    const project = await this.projectUseCase.createTeam(data, userId);

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
}
