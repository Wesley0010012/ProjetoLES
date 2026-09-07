import { AbstractEntity } from 'src/shared/domain/entities/AbstractEntity';
import { CrudRepository } from 'src/shared/domain/repositories/CrudRepository';
import { EntityRelationshipAccessor } from '../../protocols/relationships/EntityRelationshipAccessor';
import { AbstractEntityRelationship } from './AbstractEntityRelationship';

export class RemoveEntityRelationship<
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
    await this.findRelated(relatedId);

    this.accessor.set(
      owner,
      this.accessor.get(owner).filter((related) => related.id !== relatedId),
    );
    await this.ownerRepository.update(owner);
  }
}
