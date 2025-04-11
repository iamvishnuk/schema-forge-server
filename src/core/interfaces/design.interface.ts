import { DesignEntity } from '../entities/design.entity';

export interface DesignInterface {
  create(data: Partial<DesignEntity>): Promise<DesignEntity>;
}
