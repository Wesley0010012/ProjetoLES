import { AbstractEntity } from '../../entities/AbstractEntity';

export interface UpdateRepository<E extends AbstractEntity> {
  update(entity: E): Promise<void>;
}
