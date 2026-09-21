import { BookSalePrice } from 'src/stock/domain/entities/BookSalePrice';
import { BookSalePriceRepository } from 'src/stock/domain/repositories/BookSalePriceRepository';
import { InMemoryAbstractEntityRepository } from 'src/shared/infrastructure/persistence/in-memory/InMemoryAbstractEntityRepository';
import { BOOK_SALE_PRICES_SEED } from './StockSeed';

export class InMemoryBookSalePriceRepository
  extends InMemoryAbstractEntityRepository<BookSalePrice>
  implements BookSalePriceRepository
{
  protected override seed(): void {
    this._entities.push(...BOOK_SALE_PRICES_SEED);
  }

  public async findByBookId(bookId: number): Promise<BookSalePrice | null> {
    return this._entities.find((price) => price.book.id === bookId) ?? null;
  }
}
