import { CrudRepository } from 'src/shared/domain/repositories/CrudRepository';
import { StockEntry } from '../entities/StockEntry';

export interface StockEntryRepository extends CrudRepository<StockEntry> {
  highestUnitCostByBookId(bookId: number): Promise<number>;
}
