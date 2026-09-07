import { AbstractEntity } from 'src/shared/domain/entities/AbstractEntity';

export interface EntityRelationshipAccessor<
  Owner extends AbstractEntity,
  Related extends AbstractEntity,
> {
  get(owner: Owner): Related[];
  set(owner: Owner, relatedEntities: Related[]): void;
}
