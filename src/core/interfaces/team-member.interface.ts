import { IGetUserTeams } from '../../definitions/interface';
import {
  TeamMemberEntity,
  TeamMemberWithUser
} from '../entities/team-member.entity';

export interface TeamMemberInterface {
  create(data: Partial<TeamMemberEntity>): Promise<TeamMemberEntity>;
  getAllUserTeams(userId: string): Promise<IGetUserTeams[]>;
  getAllTeamMembers(teamId: string): Promise<TeamMemberWithUser[]>;
}
