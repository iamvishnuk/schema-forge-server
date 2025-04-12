import { DesignEntity } from '../entities/design.entity';

export interface DesignInterface {
  create(data: Partial<DesignEntity>): Promise<DesignEntity>;
  getDesignByProjectId(projectId: string): Promise<DesignEntity | null>;
}
