import { AbstractEntity } from 'src/shared/domain/entities/AbstractEntity';
import { MessageKeyEnum } from 'src/shared/domain/enums/MessageKeyEnum';
import { NotFound } from 'src/shared/domain/errors/NotFound';
import { CrudRepository } from 'src/shared/domain/repositories/CrudRepository';
import { EntityRelationshipAccessor } from '../../protocols/relationships/EntityRelationshipAccessor';
import { AbstractEntityRelationship } from './AbstractEntityRelationship';

export class ChangeEntityRelationship<
  Owner extends AbstractEntity,
  Related extends AbstractEntity,
> extends AbstractEntityRelationship<Owner, Related> {
  public constructor(
    ownerRepository: CrudRepository<Owner>,
    relatedRepository: CrudRepository<Related>,
    accessor: EntityRelationshipAccessor<Owner, Related>,
  ) {
    super(ownerRepository, relatedRepository, accessor);
  }

  public async execute(
    ownerId: number,
    currentRelatedId: number,
    newRelatedId: number,
  ): Promise<void> {
    const owner = await this.findOwner(ownerId);
    const newRelated = await this.findRelated(newRelatedId);
    const relatedEntities = this.accessor.get(owner);
    const relationIndex = relatedEntities.findIndex(
      (related) => related.id === currentRelatedId,
    );

    if (relationIndex < 0) {
      throw new NotFound(MessageKeyEnum.ENTITY_NOT_FOUND, {
        id: currentRelatedId,
      });
    }

    const changedEntities = [...relatedEntities];
    changedEntities[relationIndex] = newRelated;
    this.accessor.set(owner, changedEntities);
    await this.ownerRepository.update(owner);
  }
}
