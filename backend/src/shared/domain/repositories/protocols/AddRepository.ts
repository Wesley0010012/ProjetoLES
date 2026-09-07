import { AbstractEntity } from '../../entities/AbstractEntity';

export interface AddRepository<E extends AbstractEntity> {
  add(entity: E): Promise<void>;
}
