import { Request, Response } from 'express';
import { TeamUseCase } from '../../core/useCases/teams.usecase';
import { TeamsRepositoryImpl } from '../../infrastructure/repositories/teams.respository';
import { asyncHandler } from '../../utils/asyncHandler';
import { ResponseHandler } from '../../utils/responseHandler';
import { HTTPSTATUS } from '../../config/http.config';

export class TeamController {
  private teamUseCase: TeamUseCase;
  private teamRepository: TeamsRepositoryImpl;

  constructor() {
    this.teamRepository = new TeamsRepositoryImpl();
    this.teamUseCase = new TeamUseCase(this.teamRepository);
  }

  public createTeam = asyncHandler(async (req: Request, res: Response) => {
    const { name, description } = req.body;
    const createdBy = req?.user?._id as string;

    const newTeam = await this.teamUseCase.createTeam(
      createdBy,
      name,
      description
    );

    ResponseHandler.success(res, newTeam, 201, 'Team created successfully');
  });

  public getUserTeams = asyncHandler(async (req: Request, res: Response) => {
    const userId = req?.user?._id as string;
    const userTeam = await this.teamUseCase.getAllUserTeams(userId);
    ResponseHandler.success(
      res,
      userTeam,
      HTTPSTATUS.OK,
      'User teams fetched successfully'
    );
  });

  public updateTeam = asyncHandler(async (req: Request, res: Response) => {
    const { teamId } = req.params;
    const { name, description } = req.body;

    const updatedTeam = await this.teamUseCase.updateTeam(
      name,
      teamId,
      description
    );

    ResponseHandler.success(
      res,
      updatedTeam,
      HTTPSTATUS.OK,
      'Team updated successfully'
    );
  });

  public deleteTeam = asyncHandler(async (req: Request, res: Response) => {
    const { teamId } = req.params;
    await this.teamUseCase.deleteTeam(teamId);
    ResponseHandler.success(res, {}, HTTPSTATUS.OK, 'Team deleted');
  });
}
