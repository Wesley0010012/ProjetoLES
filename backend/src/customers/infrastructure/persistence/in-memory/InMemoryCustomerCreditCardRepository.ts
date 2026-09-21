import { CustomerCreditCard } from 'src/customers/domain/entities/CustomerCreditCard';
import { CustomerCreditCardRepository } from 'src/customers/domain/repositories/CustomerCreditCardRepository';
import { InMemoryAbstractEntityRepository } from 'src/shared/infrastructure/persistence/in-memory/InMemoryAbstractEntityRepository';

export class InMemoryCustomerCreditCardRepository
  extends InMemoryAbstractEntityRepository<CustomerCreditCard>
  implements CustomerCreditCardRepository
{
  public constructor(seed: CustomerCreditCard[] = []) {
    super();
    this._entities.push(...seed);
  }

  public findByCustomerId(id: number): Promise<CustomerCreditCard[]> {
    return Promise.resolve(
      this._entities.filter(
        (card) => card.customer.id === id && card.isActive(),
      ),
    );
  }
}
