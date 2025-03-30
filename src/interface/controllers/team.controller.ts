import { Request, Response } from 'express';
import { TeamUseCase } from '../../core/useCases/teams.usecase';
import { TeamsRepositoryImpl } from '../../infrastructure/repositories/teams.respository';
import { asyncHandler } from '../../utils/asyncHandler';
import { ResponseHandler } from '../../utils/responseHandler';
import { HTTPSTATUS } from '../../config/http.config';
import { InvitationRepositoryImpl } from '../../infrastructure/repositories/invitation.repository';
import { NodemailerService } from '../../infrastructure/email/services/NodemailerService';
import { UnauthorizedError } from '../../utils/error';

export class TeamController {
  private teamUseCase: TeamUseCase;
  private teamRepository: TeamsRepositoryImpl;
  private invitationRepository: InvitationRepositoryImpl;
  private emailService: NodemailerService;

  constructor() {
    this.teamRepository = new TeamsRepositoryImpl();
    this.invitationRepository = new InvitationRepositoryImpl();
    this.emailService = new NodemailerService();
    this.teamUseCase = new TeamUseCase(
      this.teamRepository,
      this.invitationRepository,
      this.emailService
    );
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

  public getTeamById = asyncHandler(async (req: Request, res: Response) => {
    const { teamId } = req.params;
    const userId = req?.user?._id as string;

    const team = await this.teamUseCase.getTeamById(teamId, userId);

    ResponseHandler.success(
      res,
      team,
      HTTPSTATUS.OK,
      'Team fetched successfully'
    );
  });

  public inviteTeamMember = asyncHandler(
    async (req: Request, res: Response) => {
      const { teamId, inviteeEmail, role } = req.body;
      const user = req.user;

      if (!user) {
        throw new UnauthorizedError('User not authenticated');
      }

      const { email, url } = await this.teamUseCase.inviteMemberToTeam({
        inviteeEmail,
        teamId,
        user,
        role
      });

      ResponseHandler.success(
        res,
        { email, url },
        HTTPSTATUS.OK,
        'Invitation sent successfully'
      );
    }
  );
}
