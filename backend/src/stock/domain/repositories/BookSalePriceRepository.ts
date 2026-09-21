import { CrudRepository } from 'src/shared/domain/repositories/CrudRepository';
import { BookSalePrice } from '../entities/BookSalePrice';

export interface BookSalePriceRepository extends CrudRepository<BookSalePrice> {
  findByBookId(bookId: number): Promise<BookSalePrice | null>;
}
