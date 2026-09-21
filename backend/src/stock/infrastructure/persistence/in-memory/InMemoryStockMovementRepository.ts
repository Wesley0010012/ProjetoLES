import { StockMovement } from 'src/stock/domain/entities/StockMovement';
import { StockMovementRepository } from 'src/stock/domain/repositories/StockMovementRepository';
import { InMemoryAbstractEntityRepository } from 'src/shared/infrastructure/persistence/in-memory/InMemoryAbstractEntityRepository';
import { STOCK_MOVEMENTS_SEED } from './StockSeed';

export class InMemoryStockMovementRepository
  extends InMemoryAbstractEntityRepository<StockMovement>
  implements StockMovementRepository
{
  protected override seed(): void {
    this._entities.push(...STOCK_MOVEMENTS_SEED);
  }
}
