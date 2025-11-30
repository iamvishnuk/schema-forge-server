import { ProjectMemberEntity } from '../entities/project-member.entity';

export interface ProjectMemberInterface {
  create(data: Partial<ProjectMemberEntity>): Promise<ProjectMemberEntity>;
  getAllProjectMembers(projectId: string): Promise<ProjectMemberEntity[]>;
  findByProjectIdAndUserId(
    projectId: string,
    userId: string
  ): Promise<ProjectMemberEntity | null>;
  getProjectByUserId(userId: string): Promise<ProjectMemberEntity[]>;
  getAllUserProjects(userId: string): Promise<ProjectMemberEntity[]>;
  changeRole(id: string, role: string): Promise<ProjectMemberEntity | null>;
  getProjectMemberById(id: string): Promise<ProjectMemberEntity | null>;
  deleteProjectMemberById(id: string): Promise<ProjectMemberEntity | null>;
}
