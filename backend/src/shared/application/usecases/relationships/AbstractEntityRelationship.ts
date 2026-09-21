import { FindRequiredEntity } from '../FindRequiredEntity';
import { AbstractEntity } from 'src/shared/domain/entities/AbstractEntity';
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

  protected findOwner(ownerId: number): Promise<Owner> {
    return new FindRequiredEntity(this.ownerRepository).execute(ownerId);
  }

  protected findRelated(relatedId: number): Promise<Related> {
    return new FindRequiredEntity(this._relatedRepository).execute(relatedId);
  }
}
