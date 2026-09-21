import { AbstractEntity } from '../../domain/entities/AbstractEntity';
import { MessageKeyEnum } from '../../domain/enums/MessageKeyEnum';
import { NotFound } from '../../domain/errors/NotFound';
import { FindByIdRepository } from '../../domain/repositories/protocols/FindByIdRepository';

/** Reúne a busca obrigatória de uma entidade usada por casos de uso de negócio. */
export class FindRequiredEntity<Entity extends AbstractEntity> {
  public constructor(private readonly repository: FindByIdRepository<Entity>) {}

  public async execute(id: number): Promise<Entity> {
    const entity = await this.repository.findById(id);
    if (!entity) {
      throw new NotFound(MessageKeyEnum.ENTITY_NOT_FOUND, { id });
    }
    return entity;
  }
}
