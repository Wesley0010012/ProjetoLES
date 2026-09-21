import { SalesSearch } from 'src/sales/application/SalesSearch';
import { Sale } from 'src/sales/domain/entities/Sale';
import { SaleRepository } from 'src/sales/domain/repositories/SaleRepository';
import { InMemoryAbstractEntityRepository } from 'src/shared/infrastructure/persistence/in-memory/InMemoryAbstractEntityRepository';

export class InMemorySaleRepository
  extends InMemoryAbstractEntityRepository<Sale>
  implements SaleRepository
{
  public constructor(seed: Sale[] = []) {
    super();
    this._entities.push(...seed);
  }

  protected override matchesSearch(sale: Sale, search: SalesSearch): boolean {
    return (
      search.customerId === undefined || sale.customer.id === search.customerId
    );
  }

  public nextCode(): string {
    return `VEN-${String(this.getNextId()).padStart(6, '0')}`;
  }
}
