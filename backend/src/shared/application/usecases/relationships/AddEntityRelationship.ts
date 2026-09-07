import { AbstractEntity } from 'src/shared/domain/entities/AbstractEntity';
import { CrudRepository } from 'src/shared/domain/repositories/CrudRepository';
import { EntityRelationshipAccessor } from '../../protocols/relationships/EntityRelationshipAccessor';
import { AbstractEntityRelationship } from './AbstractEntityRelationship';

export class AddEntityRelationship<
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

  public async execute(ownerId: number, relatedId: number): Promise<void> {
    const owner = await this.findOwner(ownerId);
    const related = await this.findRelated(relatedId);
    const relatedEntities = this.accessor.get(owner);

    if (!relatedEntities.some((current) => current.id === related.id)) {
      this.accessor.set(owner, [...relatedEntities, related]);
      await this.ownerRepository.update(owner);
    }
  }
}
