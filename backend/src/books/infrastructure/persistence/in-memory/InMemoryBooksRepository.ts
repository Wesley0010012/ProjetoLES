import { Book } from 'src/books/domain/entities/Book';
import { BookRepository } from 'src/books/domain/repositories/BookRepository';
import { InMemoryAbstractEntityRepository } from 'src/shared/infrastructure/persistence/in-memory/InMemoryAbstractEntityRepository';
import { Search } from 'src/shared/domain/repositories/Search';
import { BookSearch } from 'src/books/application/BookSearch';
import { BOOKS_SEED } from './BooksSeed';

export class InMemoryBooksRepository
  extends InMemoryAbstractEntityRepository<Book>
  implements BookRepository
{
  protected override seed(): void {
    this._entities.push(...BOOKS_SEED);
  }
  protected override matchesSearch(entity: Book, search: Search): boolean {
    if (!entity.isActive()) return false;
    return search instanceof BookSearch ? search.matches(entity) : true;
  }
}
