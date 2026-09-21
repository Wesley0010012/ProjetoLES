import { Repository } from 'typeorm';
import { CustomerCreditCard } from 'src/customers/domain/entities/CustomerCreditCard';
import { CustomerCreditCardRepository } from 'src/customers/domain/repositories/CustomerCreditCardRepository';
import { DomainEntityCodec } from 'src/shared/infrastructure/persistence/postgres/DomainEntityCodec';
import { PersistedDomainEntity } from 'src/shared/infrastructure/persistence/postgres/PersistedDomainEntity';
import { PostgresAbstractEntityRepository } from 'src/shared/infrastructure/persistence/postgres/PostgresAbstractEntityRepository';

export class PostgresCustomerCreditCardRepository
  extends PostgresAbstractEntityRepository<CustomerCreditCard>
  implements CustomerCreditCardRepository
{
  public constructor(
    records: Repository<PersistedDomainEntity>,
    codec: DomainEntityCodec,
  ) {
    super(records, codec, 'customers.CustomerCreditCard');
  }

  public async findByCustomerId(id: number): Promise<CustomerCreditCard[]> {
    return (await this.all()).filter(
      (item) => item.customer.id === id && item.isActive(),
    );
  }
}
