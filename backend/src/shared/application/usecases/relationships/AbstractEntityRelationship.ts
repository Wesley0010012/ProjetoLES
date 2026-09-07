import { AbstractEntity } from 'src/shared/domain/entities/AbstractEntity';
import { MessageKeyEnum } from 'src/shared/domain/enums/MessageKeyEnum';
import { NotFound } from 'src/shared/domain/errors/NotFound';
import { CrudRepository } from 'src/shared/domain/repositories/CrudRepository';
import { EntityRelationshipAccessor } from '../../protocols/relationships/EntityRelationshipAccessor';

export abstract class AbstractEntityRelationship<
  Owner extends AbstractEntity,
  Related extends AbstractEntity,
> {
  protected constructor(
    protected readonly ownerRepository: CrudRepository<Owner>,
    private readonly _relatedRepository: CrudRepository<Related>,
    protected readonly accessor: EntityRelationshipAccessor<Owner, Related>,
  ) {}

  protected async findOwner(ownerId: number): Promise<Owner> {
    const owner = await this.ownerRepository.findById(ownerId);

    if (!owner) {
      throw new NotFound(MessageKeyEnum.ENTITY_NOT_FOUND, { id: ownerId });
    }

    return owner;
  }

  protected async findRelated(relatedId: number): Promise<Related> {
    const related = await this._relatedRepository.findById(relatedId);

    if (!related) {
      throw new NotFound(MessageKeyEnum.ENTITY_NOT_FOUND, { id: relatedId });
    }

    return related;
  }
}
