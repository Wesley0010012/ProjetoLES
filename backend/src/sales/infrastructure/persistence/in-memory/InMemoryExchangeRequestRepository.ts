import { ExchangeSearch } from 'src/sales/application/ExchangeSearch';
import { ExchangeRequest } from 'src/sales/domain/entities/ExchangeRequest';
import { ExchangeRequestRepository } from 'src/sales/domain/repositories/ExchangeRequestRepository';
import { Search } from 'src/shared/domain/repositories/Search';
import { InMemoryAbstractEntityRepository } from 'src/shared/infrastructure/persistence/in-memory/InMemoryAbstractEntityRepository';

export class InMemoryExchangeRequestRepository
  extends InMemoryAbstractEntityRepository<ExchangeRequest>
  implements ExchangeRequestRepository
{
  public constructor(seed: ExchangeRequest[] = []) {
    super();
    this._entities.push(...seed);
  }

  protected override matchesSearch(
    exchange: ExchangeRequest,
    search: Search,
  ): boolean {
    if (!(search instanceof ExchangeSearch)) return true;
    return (
      (search.saleId === undefined || exchange.sale.id === search.saleId) &&
      (search.status === undefined || exchange.status === search.status)
    );
  }

  public nextCode(): string {
    return `TRO-${String(this.getNextId()).padStart(6, '0')}`;
  }
}
