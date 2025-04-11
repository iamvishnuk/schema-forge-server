import mongoose from 'mongoose';
import { TeamEntity } from '../entities/teams.entity';
import { TeamRepository } from '../interfaces/team.repository';
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  TooManyRequests,
  UnauthorizedError
} from '../../utils/error';
import { MAX_PROJECT_PER_USER } from '../../config/constant';
import { IGetUserTeams, IInviteTeamMember } from '../../definitions/interface';
import { anHourFromNow, threeMinutesAgo } from '../../utils/date-time';
import { InvitationRepository } from '../interfaces/invitation.repository';
import { config } from '../../config/env';
import { IEmailService } from '../../infrastructure/services/email/interface/IEmailService';
import { teamInvitationTemplate } from '../../infrastructure/services/email/templates/template';
import { Request } from 'express';
import {
  MemberStatusEnum,
  TeamMemberEntity,
  TeamMemberWithUser,
  TeamRoleEnum
} from '../entities/team-member.entity';
import { TeamMemberInterface } from '../interfaces/team-member.interface';

export class TeamUseCase {
  constructor(
    private teamRepository: TeamRepository,
    private invitationRepository: InvitationRepository,
    private teamMemberRepository: TeamMemberInterface,
    private emailService: IEmailService
  ) {}

  /**
   * Creates a new team with the provided details
   * @param createdBy - ID of the user creating the team
   * @param name - Name of the team
   * @param description - Optional description of the team
   * @returns Newly created team entity
   * @throws ForbiddenError if user has reached maximum number of teams
   * @throws BadRequestError if team creation fails
   */
  async createTeam(
    createdBy: string,
    name: string,
    description?: string
  ): Promise<TeamEntity> {
    // Check if user has reached the maximum number of teams
    const userTeamsCount = await this.teamRepository.countUserTeams(
      createdBy as unknown as mongoose.Types.ObjectId
    );

    if (userTeamsCount >= MAX_PROJECT_PER_USER) {
      throw new ForbiddenError('You have reached the maximum number of teams');
    }

    // Prepare team entity with creator as the owner
    const team: Partial<TeamEntity> = {
      name,
      description,
      createdBy: createdBy as unknown as mongoose.Types.ObjectId
    };

    // Create the team in repository
    const newTeam = await this.teamRepository.create(team);

    if (!newTeam) {
      throw new BadRequestError('Failed to create team');
    }

    return newTeam;
  }

  /**
   * Retrieves all teams associated with a specific user
   *
   * @param userId - The ID of the user whose teams are to be retrieved
   * @returns A promise that resolves to an array of TeamEntity objects
   *
   * @remarks
   * This method casts the string userId to a mongoose ObjectId before querying the repository
   */
  async getAllUserTeams(userId: string): Promise<IGetUserTeams[]> {
    return await this.teamMemberRepository.getAllUserTeams(userId);
  }

  /**
   * Updates an existing team with new information
   *
   * @param name - The new name for the team
   * @param teamId - The ID of the team to update
   * @param description - Optional new description for the team
   * @returns Updated team entity
   * @throws NotFoundError if the team doesn't exist
   * @throws BadRequestError if team update fails
   */
  async updateTeam(
    name: string,
    teamId: string,
    description?: string
  ): Promise<TeamEntity> {
    // Verify the team exists before attempting to update
    const team = await this.teamRepository.findTeamById(
      teamId as unknown as mongoose.Types.ObjectId
    );
    if (!team) {
      throw new NotFoundError('Team not found');
    }

    // Attempt to update the team with new information
    const updatedTeam = await this.teamRepository.updateTeam(
      teamId as unknown as mongoose.Types.ObjectId,
      { name, description }
    );

    // Ensure the update operation was successful
    if (!updatedTeam) {
      throw new BadRequestError('Failed to update team');
    }

    return updatedTeam;
  }

  /**
   * Deletes a team from the repository by its ID.
   *
   * @param teamId - The unique identifier of the team to delete
   * @returns A Promise that resolves when the team is successfully deleted
   * @throws {NotFoundError} If no team with the given ID exists
   */
  async deleteTeam(teamId: string): Promise<void> {
    const deletedTeam = await this.teamRepository.findByIdAndDelete(teamId);

    if (!deletedTeam) {
      throw new NotFoundError('Team not found');
    }

    return;
  }

  /**
   * Retrieves a team and its members by team ID
   *
   * @param teamId - The ID of the team to retrieve
   * @param userId - The ID of the user making the request
   * @returns Object containing team members and team entity
   * @throws ForbiddenError if the user is not a member of the team
   * @throws NotFoundError if the team doesn't exist
   */
  async getTeamById(
    teamId: string,
    userId: string
  ): Promise<{ teamMember: TeamMemberWithUser[]; team: TeamEntity }> {
    // Get all members of the team
    const teamMember =
      await this.teamMemberRepository.getAllTeamMembers(teamId);

    // Find the team by its ID
    const team = await this.teamRepository.findTeamById(
      teamId as unknown as mongoose.Types.ObjectId
    );

    // Check if the requesting user is a member of the team
    const isMember = teamMember.some((member) => {
      return (
        member?.userId &&
        (member.userId._id as mongoose.Types.ObjectId).toString() ===
          userId.toString()
      );
    });

    // Throw error if user is not a team member
    if (!isMember) {
      throw new ForbiddenError('You do not have access to this team');
    }

    // Throw error if team doesn't exist
    if (!team) {
      throw new NotFoundError('Team not found');
    }

    // Return team members and team entity
    return {
      teamMember,
      team
    };
  }

  /**
   * Invites a new member to join a team
   *
   * @param data - Object containing invitation details (teamId, user, inviteeEmail, role)
   * @returns Object containing the invitation URL and the invitee's email
   * @throws NotFoundError if the team doesn't exist
   * @throws BadRequestError if user is already a team member
   * @throws ForbiddenError if the current user is not authorized to send invites
   * @throws TooManyRequests if too many invitations were sent recently
   */
  async inviteMemberToTeam(
    data: IInviteTeamMember
  ): Promise<{ url: string; email: string }> {
    const { teamId, user, inviteeEmail, role } = data;

    // Find the team and validate it exists
    const team = await this.teamRepository.findTeamById(
      teamId as unknown as mongoose.Types.ObjectId
    );

    if (!team) {
      throw new NotFoundError('Team not found');
    }

    // Check if the invitee is already a member of the team
    const teamMember =
      await this.teamMemberRepository.getAllTeamMembers(teamId);

    const isMember = teamMember.some((member) => {
      return member.userId.email === inviteeEmail;
    });

    if (isMember) {
      throw new BadRequestError('User is already a member of the team');
    }

    // Verify the current user has permission to invite members (admin or owner)
    const isAdmin = teamMember.some(
      (member) =>
        member.userId._id === user._id && member.role === TeamRoleEnum.ADMIN
    );

    const isOwner = team.createdBy.toString() === String(user._id);

    if (!isAdmin && !isOwner) {
      throw new ForbiddenError('You are not authorized to invite members');
    }

    // Prevent invitation spam by limiting attempts
    const timeAgo = threeMinutesAgo();
    const maxAttempts = 2;

    const invitationAttempts = await this.invitationRepository.countInvitations(
      {
        inviteeEmail,
        teamId: teamId as unknown as mongoose.Types.ObjectId
      },
      { $gt: timeAgo }
    );

    if (invitationAttempts >= maxAttempts) {
      throw new TooManyRequests(
        'Too many invitation to this email, Please try again later'
      );
    }

    // Create invitation with expiration time
    const expiresAt = anHourFromNow();

    const invitation = await this.invitationRepository.createInvitation({
      teamId: teamId as unknown as mongoose.Types.ObjectId,
      invitedBy: user._id as unknown as mongoose.Types.ObjectId,
      inviteeEmail,
      role,
      expiresAt
    });

    // Generate invitation link with all necessary parameters
    const invitationLink = `${config.APP_ORIGIN}/accept-invitation?token=${invitation.token}&exp=${expiresAt.getTime()}&email=${inviteeEmail}&teamId=${teamId}&teamName=${team.name}`;

    // Send invitation email to the invitee
    await this.emailService.sendEmail({
      to: inviteeEmail,
      ...teamInvitationTemplate(invitationLink, team.name, user.name)
    });

    return {
      url: invitationLink,
      email: inviteeEmail
    };
  }

  /**
   * Processes an invitation acceptance by validating the token and adding the user to the team
   *
   * @param token - The unique invitation token to validate
   * @param req - Express request object containing authenticated user data
   * @returns Object with success message and team ID
   * @throws UnauthorizedError if user is not authenticated
   * @throws NotFoundError if invitation or team doesn't exist
   * @throws BadRequestError if invitation is expired or email mismatch occurs
   */
  async acceptInvitation(token: string, req: Request) {
    const user = req.user;

    // Verify user is authenticated
    if (!user) {
      throw new UnauthorizedError('User not authenticated');
    }

    // Retrieve invitation by token
    const invitation =
      await this.invitationRepository.findInvitationByToken(token);

    if (!invitation) {
      throw new NotFoundError('Invitation not found');
    }

    // Validate invitation hasn't expired
    const now = Date.now();
    if (now > invitation.expiresAt.getTime()) {
      throw new BadRequestError('Invitation has expired');
    }

    // Ensure the invitation was sent to the current user's email
    if (invitation.inviteeEmail !== user.email) {
      throw new BadRequestError('Invitation email does not match user email');
    }

    // Find the team and its members
    const team = await this.teamRepository.findTeamById(invitation.teamId);

    if (!team) {
      throw new NotFoundError('Team not found');
    }

    const teamMember = await this.teamMemberRepository.getAllTeamMembers(
      invitation.teamId as unknown as string
    );

    // Check if user is already a team member
    const isMember = teamMember.some((member) => {
      return member.userId.email === user.email;
    });

    // Return early if user is already a member
    if (isMember) {
      return {
        message: 'You are already a member of this team',
        teamId: team._id
      };
    }

    // Add the user to the team with the assigned role
    const newMember = await this.teamMemberRepository.create({
      userId: user._id as unknown as mongoose.Types.ObjectId,
      teamId: team._id as unknown as mongoose.Types.ObjectId,
      role: invitation.role as unknown as TeamRoleEnum,
      status: MemberStatusEnum.ACTIVE
    });

    if (!newMember) {
      throw new BadRequestError('Failed to accept invitation');
    }

    // Delete the invitation once it's been successfully accepted
    await this.invitationRepository.findInvitationByTokenAndDelete(token);

    return {
      message: 'Invitation accepted successfully',
      teamId: team._id
    };
  }

  async removeOrLeaveTeam(
    id: string,
    userId: string
  ): Promise<{ message: string; isSelf: boolean }> {
    const teamMember = await this.teamMemberRepository.getTeamMemberById(id);

    if (!teamMember) {
      throw new NotFoundError(
        'You are not a member of this team or cannot remove the user'
      );
    }

    // check if the user is the owner of the team
    const isOwner = teamMember.role === TeamRoleEnum.OWNER;
    if (isOwner) {
      throw new ForbiddenError('You cannot remove the owner of the team');
    }

    const isSelf = teamMember.userId.toString() === userId.toString();

    const deleteTeamMember =
      await this.teamMemberRepository.deleteTeamMemberById(id);

    if (!deleteTeamMember) {
      throw new NotFoundError(
        isSelf ? 'Failed to leave team' : 'Failed to remove user from team'
      );
    }

    return {
      message: isSelf
        ? 'You have successfully left the team'
        : 'User has been removed from the team',
      isSelf
    };
  }

  async changeTeamMemberRole(
    id: string,
    role: string
  ): Promise<TeamMemberEntity> {
    const teamMember = await this.teamMemberRepository.changeRole(id, role);

    if (!teamMember) {
      throw new NotFoundError('Failed to change team member role');
    }

    return teamMember;
  }

  async getUserCreatedTeams(userId: string): Promise<TeamEntity[]> {
    return await this.teamRepository.findUserCreatedTeams(userId);
  }
}
