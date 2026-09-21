import { StockEntry } from 'src/stock/domain/entities/StockEntry';
import { StockEntryRepository } from 'src/stock/domain/repositories/StockEntryRepository';
import { InMemoryAbstractEntityRepository } from 'src/shared/infrastructure/persistence/in-memory/InMemoryAbstractEntityRepository';
import { STOCK_ENTRIES_SEED } from './StockSeed';

export class InMemoryStockEntryRepository
  extends InMemoryAbstractEntityRepository<StockEntry>
  implements StockEntryRepository
{
  protected override seed(): void {
    this._entities.push(...STOCK_ENTRIES_SEED);
  }

  public async highestUnitCostByBookId(bookId: number): Promise<number> {
    return this._entities
      .filter((entry) => entry.book.id === bookId)
      .reduce((highest, entry) => Math.max(highest, entry.unitCost), 0);
  }
}
