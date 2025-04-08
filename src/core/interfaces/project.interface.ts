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
}
