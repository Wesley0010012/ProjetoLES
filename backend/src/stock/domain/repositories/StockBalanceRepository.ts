import { CrudRepository } from 'src/shared/domain/repositories/CrudRepository';
import { StockBalance } from '../entities/StockBalance';

export interface StockBalanceRepository extends CrudRepository<StockBalance> {
  findByBookId(bookId: number): Promise<StockBalance | null>;
}
