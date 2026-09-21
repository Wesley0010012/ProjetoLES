import { StockBalance } from 'src/stock/domain/entities/StockBalance';
import { StockBalanceRepository } from 'src/stock/domain/repositories/StockBalanceRepository';
import { InMemoryAbstractEntityRepository } from 'src/shared/infrastructure/persistence/in-memory/InMemoryAbstractEntityRepository';
import { STOCK_BALANCES_SEED } from './StockSeed';

export class InMemoryStockBalanceRepository
  extends InMemoryAbstractEntityRepository<StockBalance>
  implements StockBalanceRepository
{
  protected override seed(): void {
    this._entities.push(...STOCK_BALANCES_SEED);
  }

  public async findByBookId(bookId: number): Promise<StockBalance | null> {
    return this._entities.find((balance) => balance.book.id === bookId) ?? null;
  }
}
