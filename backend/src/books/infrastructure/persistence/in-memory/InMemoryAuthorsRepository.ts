import { Author } from 'src/books/domain/entities/Author';
import { AuthorRepository } from 'src/books/domain/repositories/AuthorRepository';
import { InMemoryAbstractEntityRepository } from 'src/shared/infrastructure/persistence/in-memory/InMemoryAbstractEntityRepository';
import { AUTHORS_SEED } from './BooksSeed';

export class InMemoryAuthorsRepository
  extends InMemoryAbstractEntityRepository<Author>
  implements AuthorRepository
{
  protected override seed(): void {
    this._entities.push(...AUTHORS_SEED);
  }
  protected override matchesSearch(entity: Author): boolean {
    return entity.isActive();
  }
}
