import { InjectionToken } from '@nestjs/common';
import { Repository } from 'typeorm';
import { AbstractEntity } from 'src/shared/domain/entities/AbstractEntity';
import { PostgresAbstractEntityRepository } from 'src/shared/infrastructure/persistence/postgres/PostgresAbstractEntityRepository';
import { Module } from '@nestjs/common';
import { StockModule } from 'src/stock/stock.module';
import { InMemoryStockBalanceRepository } from 'src/stock/infrastructure/persistence/in-memory/InMemoryStockBalanceRepository';
import { InMemoryBooksRepository } from './infrastructure/persistence/in-memory/InMemoryBooksRepository';
import { InMemoryAuthorsRepository } from './infrastructure/persistence/in-memory/InMemoryAuthorsRepository';
import { InMemoryCategoriesRepository } from './infrastructure/persistence/in-memory/InMemoryCategoriesRepository';
import { InMemoryEditorsRepository } from './infrastructure/persistence/in-memory/InMemoryEditorsRepository';
import { InMemoryPrecificationGroupsRepository } from './infrastructure/persistence/in-memory/InMemoryPrecificationGroupsRepository';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PersistedDomainEntity } from 'src/shared/infrastructure/persistence/postgres/PersistedDomainEntity';
import { DomainEntityCodec } from 'src/shared/infrastructure/persistence/postgres/DomainEntityCodec';
import { PersistenceModule } from 'src/shared/infrastructure/persistence/postgres/PersistenceModule';
import { withReadCache } from 'src/shared/infrastructure/persistence/withReadCache';
import {
  AUTHORS_SEED,
  BOOKS_SEED,
  CATEGORIES_SEED,
  EDITORS_SEED,
  PRECIFICATION_GROUPS_SEED,
} from './infrastructure/persistence/in-memory/BooksSeed';
import { PostgresAuthorsRepository } from './infrastructure/persistence/postgres/PostgresAuthorsRepository';
import { PostgresBooksRepository } from './infrastructure/persistence/postgres/PostgresBooksRepository';
import { PostgresCategoriesRepository } from './infrastructure/persistence/postgres/PostgresCategoriesRepository';
import { PostgresEditorsRepository } from './infrastructure/persistence/postgres/PostgresEditorsRepository';
import { PostgresPrecificationGroupsRepository } from './infrastructure/persistence/postgres/PostgresPrecificationGroupsRepository';
import { FindAll } from 'src/shared/application/usecases/FindAll';
import { EntityPageToEntityPageDto } from 'src/shared/application/protocols/mappers/EntityPageToEntityPageDto';
import { Book } from './domain/entities/Book';
import { Category } from './domain/entities/Category';
import { BookMapper } from './application/mappers/BookMapper';
import { CategoryMapper } from './application/mappers/CategoryMapper';
import { ProductBookDto } from './application/dto/output/ProductBookDto';
import { CategoryDto } from './application/dto/output/CategoryDto';
import { BookSearch } from './application/BookSearch';
import { CatalogSearch } from './application/CatalogSearch';
import { BooksController } from './presentation/controllers/BooksController';
import { CategoriesController } from './presentation/controllers/CategoriesController';
import { BOOK_USE_CASES } from './presentation/controllers/BookUseCases';
import type { BookUseCases } from './presentation/controllers/BookUseCases';
const provider = <Entity extends AbstractEntity>(
  token: InjectionToken,
  RepositoryClass: new (
    records: Repository<PersistedDomainEntity>,
    codec: DomainEntityCodec,
  ) => PostgresAbstractEntityRepository<Entity>,
  seed: Entity[],
) => ({
  provide: token,
  inject: [getRepositoryToken(PersistedDomainEntity), DomainEntityCodec],
  useFactory: (
    records: Repository<PersistedDomainEntity>,
    codec: DomainEntityCodec,
  ) =>
    new RepositoryClass(records, codec)
      .seedIfEmpty(() => seed)
      .then((repository) => withReadCache(repository)),
});
const repositories = [
  provider(InMemoryAuthorsRepository, PostgresAuthorsRepository, AUTHORS_SEED),
  provider(
    InMemoryCategoriesRepository,
    PostgresCategoriesRepository,
    CATEGORIES_SEED,
  ),
  provider(InMemoryEditorsRepository, PostgresEditorsRepository, EDITORS_SEED),
  provider(
    InMemoryPrecificationGroupsRepository,
    PostgresPrecificationGroupsRepository,
    PRECIFICATION_GROUPS_SEED,
  ),
  provider(InMemoryBooksRepository, PostgresBooksRepository, BOOKS_SEED),
];
@Module({
  imports: [PersistenceModule, StockModule],
  controllers: [BooksController, CategoriesController],
  providers: [
    ...repositories,
    {
      provide: BOOK_USE_CASES,
      inject: [
        InMemoryBooksRepository,
        InMemoryCategoriesRepository,
        InMemoryStockBalanceRepository,
      ],
      useFactory: (
        books: InMemoryBooksRepository,
        categories: InMemoryCategoriesRepository,
        balances: InMemoryStockBalanceRepository,
      ): BookUseCases => {
        const bookMapper = new BookMapper(balances);
        const categoryMapper = new CategoryMapper();
        const list = new FindAll<Book, ProductBookDto>(
          books,
          new EntityPageToEntityPageDto(bookMapper),
        );
        const listCategories = new FindAll<Category, CategoryDto>(
          categories,
          new EntityPageToEntityPageDto(categoryMapper),
        );

        return {
          list: async (query, category) =>
            (await list.execute(
              new BookSearch({ query, category }),
            )) as ProductBookDto[],
          // findById intentionally bypasses FindEntityById: an inactive book
          // must resolve to `null` (200) instead of NotFound (404), matching
          // the public catalog's current contract.
          findById: async (id) => {
            const book = await books.findById(id);
            if (!book || !book.isActive()) return null;
            return bookMapper.toDto(book);
          },
          categories: async () =>
            (await listCategories.execute(
              new CatalogSearch({ orderBy: 'name' }),
            )) as CategoryDto[],
        };
      },
    },
  ],
  exports: [...repositories, BOOK_USE_CASES],
})
export class BooksModule {}
