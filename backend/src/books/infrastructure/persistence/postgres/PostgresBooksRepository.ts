import { Repository } from 'typeorm';
import { Book } from '../../../domain/entities/Book';
import { BookRepository } from '../../../domain/repositories/BookRepository';
import { DomainEntityCodec } from 'src/shared/infrastructure/persistence/postgres/DomainEntityCodec';
import { PersistedDomainEntity } from 'src/shared/infrastructure/persistence/postgres/PersistedDomainEntity';
import { Search } from 'src/shared/domain/repositories/Search';
import { BookSearch } from 'src/books/application/BookSearch';
import { ActiveCatalogRepository } from './ActiveCatalogRepository';

export class PostgresBooksRepository
  extends ActiveCatalogRepository<Book>
  implements BookRepository
{
  public constructor(
    records: Repository<PersistedDomainEntity>,
    codec: DomainEntityCodec,
  ) {
    super(records, codec, 'books.Book');
  }

  protected override matchesSearch(entity: Book, search: Search): boolean {
    if (!super.matchesSearch(entity, search)) return false;
    return search instanceof BookSearch ? search.matches(entity) : true;
  }

  public override async seedIfEmpty(
    createSeed: () => Book[] | Promise<Book[]>,
  ): Promise<this> {
    await super.seedIfEmpty(createSeed);
    const prices = new Map(
      (await createSeed()).map((book) => [book.isbn, book.defaultPrice]),
    );
    // Older catalog records were seeded without defaultPrice.
    for (const book of await this.all()) {
      const price = prices.get(book.isbn);
      if (book.defaultPrice == null && price !== undefined) {
        book.defaultPrice = price;
        await this.update(book);
      }
    }
    return this;
  }
}
