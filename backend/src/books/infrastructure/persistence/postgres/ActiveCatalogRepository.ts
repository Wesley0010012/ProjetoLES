import { Author } from '../../../domain/entities/Author';
import { Book } from '../../../domain/entities/Book';
import { Category } from '../../../domain/entities/Category';
import { Editor } from '../../../domain/entities/Editor';
import { PrecificationGroup } from '../../../domain/entities/PrecificationGroup';
import { Search } from 'src/shared/domain/repositories/Search';
import { PostgresAbstractEntityRepository } from 'src/shared/infrastructure/persistence/postgres/PostgresAbstractEntityRepository';

type CatalogEntity = Author | Book | Category | Editor | PrecificationGroup;

/** Comportamento de leitura comum às entidades ativas do catálogo. */
export abstract class ActiveCatalogRepository<
  Entity extends CatalogEntity,
> extends PostgresAbstractEntityRepository<Entity> {
  protected override matchesSearch(entity: Entity, search: Search): boolean {
    void search;
    return entity.isActive();
  }
}
