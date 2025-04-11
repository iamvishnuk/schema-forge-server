import { Request, Response } from 'express';
import { TeamUseCase } from '../../core/useCases/teams.usecase';
import { TeamsRepositoryImpl } from '../../infrastructure/repositories/teams.respository';
import { asyncHandler } from '../../utils/asyncHandler';
import { ResponseHandler } from '../../utils/responseHandler';
import { HTTPSTATUS } from '../../config/http.config';
import { InvitationRepositoryImpl } from '../../infrastructure/repositories/invitation.repository';
import { NodemailerService } from '../../infrastructure/services/email/services/NodemailerService';
import { UnauthorizedError } from '../../utils/error';
import { TeamMemberRepositoryImpl } from '../../infrastructure/repositories/team-member.repository';

export class TeamController {
  private teamUseCase: TeamUseCase;
  private teamRepository: TeamsRepositoryImpl;
  private invitationRepository: InvitationRepositoryImpl;
  private emailService: NodemailerService;
  private teamMemberRepository: TeamMemberRepositoryImpl;

  constructor() {
    this.teamRepository = new TeamsRepositoryImpl();
    this.invitationRepository = new InvitationRepositoryImpl();
    this.emailService = new NodemailerService();
    this.teamMemberRepository = new TeamMemberRepositoryImpl();
    this.teamUseCase = new TeamUseCase(
      this.teamRepository,
      this.invitationRepository,
      this.teamMemberRepository,
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

    const { team, teamMember } = await this.teamUseCase.getTeamById(
      teamId,
      userId
    );

    ResponseHandler.success(
      res,
      { team, teamMember },
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

  public acceptInvitation = asyncHandler(
    async (req: Request, res: Response) => {
      const { token } = req.body;

      const { message, teamId } = await this.teamUseCase.acceptInvitation(
        token,
        req
      );

      ResponseHandler.success(res, { teamId }, HTTPSTATUS.OK, message);
    }
  );

  public removeOrLeaveTeam = asyncHandler(
    async (req: Request, res: Response) => {
      const { id } = req.params;
      const userId = req?.user?._id as string;
      const { isSelf, message } = await this.teamUseCase.removeOrLeaveTeam(
        id,
        userId
      );
      ResponseHandler.success(res, { isSelf }, HTTPSTATUS.OK, message);
    }
  );

  public changeTeamMemberRole = asyncHandler(
    async (req: Request, res: Response) => {
      const { id, role } = req.body;
      const teamMember = await this.teamUseCase.changeTeamMemberRole(id, role);

      ResponseHandler.success(
        res,
        teamMember,
        HTTPSTATUS.OK,
        'Team member role updated successfully'
      );
    }
  );

  public getUserCreatedTeams = asyncHandler(
    async (req: Request, res: Response) => {
      const userId = req?.user?._id as string;

      const teams = await this.teamUseCase.getUserCreatedTeams(userId);
      ResponseHandler.success(
        res,
        teams,
        HTTPSTATUS.OK,
        'User created teams fetched successfully'
      );
    }
  );
}
