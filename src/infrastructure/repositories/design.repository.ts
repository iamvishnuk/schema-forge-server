import { DesignEntity } from '../../core/entities/design.entity';
import { DesignInterface } from '../../core/interfaces/design.interface';
import { DesignModel } from '../models/design.model';

export class DesignRepositoryImpl implements DesignInterface {
  create(data: Partial<DesignEntity>): Promise<DesignEntity> {
    return DesignModel.create(data);
  }
}
