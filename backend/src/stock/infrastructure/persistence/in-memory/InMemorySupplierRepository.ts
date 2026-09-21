import { Supplier } from 'src/stock/domain/entities/Supplier';
import { SupplierRepository } from 'src/stock/domain/repositories/SupplierRepository';
import { InMemoryAbstractEntityRepository } from 'src/shared/infrastructure/persistence/in-memory/InMemoryAbstractEntityRepository';
import { SUPPLIERS_SEED } from './StockSeed';

export class InMemorySupplierRepository
  extends InMemoryAbstractEntityRepository<Supplier>
  implements SupplierRepository
{
  protected override seed(): void {
    this._entities.push(...SUPPLIERS_SEED);
  }
}
