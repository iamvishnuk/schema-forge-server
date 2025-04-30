import { ProjectMemberEntity } from '../entities/project-member.entity';

export interface ProjectMemberInterface {
  create(data: Partial<ProjectMemberEntity>): Promise<ProjectMemberEntity>;
  getAllProjectMembers(projectId: string): Promise<ProjectMemberEntity[]>;
  findByProjectIdAndUserId(
    projectId: string,
    userId: string
  ): Promise<ProjectMemberEntity | null>;
  getProjectByUserId(userId: string): Promise<ProjectMemberEntity[]>;
}
