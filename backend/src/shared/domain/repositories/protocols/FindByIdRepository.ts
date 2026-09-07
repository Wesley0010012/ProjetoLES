import { AbstractEntity } from '../../entities/AbstractEntity';

export interface FindByIdRepository<E extends AbstractEntity> {
  findById(id: number): Promise<E | null>;
}
