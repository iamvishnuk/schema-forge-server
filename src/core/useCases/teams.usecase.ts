import mongoose from 'mongoose';
import {
  ITeamWithDetails,
  MemberStatusEnum,
  TeamEntity,
  TeamRoleEnum
} from '../entities/teams.entity';
import { TeamRepository } from '../interfaces/team.repository';
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError
} from '../../utils/error';
import { MAX_PROJECT_PER_USER } from '../../config/constant';

export class TeamUseCase {
  constructor(private teamRepository: TeamRepository) {}

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
      createdBy: createdBy as unknown as mongoose.Types.ObjectId,
      members: [
        {
          userId: createdBy as unknown as mongoose.Types.ObjectId,
          role: TeamRoleEnum.OWNER,
          joinedAt: new Date(),
          status: MemberStatusEnum.ACTIVE
        }
      ]
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
  async getAllUserTeams(userId: string): Promise<TeamEntity[]> {
    return await this.teamRepository.getAllUserTeams(
      userId as unknown as mongoose.Types.ObjectId
    );
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
   * Retrieves a team by its ID, ensuring the requesting user has access
   *
   * @param teamId - The unique identifier of the team to retrieve
   * @param userId - The ID of the user requesting the team information
   * @returns A promise that resolves to the team with detailed information
   * @throws ForbiddenError if the user doesn't have access to the requested team
   */
  async getTeamById(teamId: string, userId: string): Promise<ITeamWithDetails> {
    const team = await this.teamRepository.getTeamById(teamId, userId);

    if (!team) {
      // Instead of creating an object, directly throw the error
      throw new ForbiddenError(
        'Team not found or you do not have access to it',
        403
      );
    }

    return team;
  }
}
