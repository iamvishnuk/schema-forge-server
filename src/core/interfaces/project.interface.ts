import { ProjectEntity } from '../entities/project.entity';

export interface ProjectInterface {
  create(data: Partial<ProjectEntity>): Promise<ProjectEntity>;
  getProjects(userId: string): Promise<ProjectEntity[]>;
  findByIdAndUpdate(
    id: string,
    data: Partial<ProjectEntity>
  ): Promise<ProjectEntity | null>;
  findProjectById(id: string): Promise<ProjectEntity | null>;
  deleteProjectById(id: string): Promise<ProjectEntity | null>;
  findProjectAssociatedTeams(id: string): Promise<ProjectEntity[]>;
  addTeamToProject(
    projectId: string,
    teamIds: string[]
  ): Promise<ProjectEntity | null>;
  removeTeamFromProject(
    projectId: string,
    teamIds: string
  ): Promise<ProjectEntity | null>;
}
