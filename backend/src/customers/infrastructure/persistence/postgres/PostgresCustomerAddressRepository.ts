import { Repository } from 'typeorm';
import { Customer } from 'src/customers/domain/entities/Customer';
import { CustomerAddress } from 'src/customers/domain/entities/CustomerAddress';
import { CustomerAddressRepository } from 'src/customers/domain/repositories/CustomerAddressRepository';
import { DomainEntityCodec } from 'src/shared/infrastructure/persistence/postgres/DomainEntityCodec';
import { PersistedDomainEntity } from 'src/shared/infrastructure/persistence/postgres/PersistedDomainEntity';
import { PostgresAbstractEntityRepository } from 'src/shared/infrastructure/persistence/postgres/PostgresAbstractEntityRepository';

export class PostgresCustomerAddressRepository
  extends PostgresAbstractEntityRepository<CustomerAddress>
  implements CustomerAddressRepository
{
  public constructor(
    records: Repository<PersistedDomainEntity>,
    codec: DomainEntityCodec,
  ) {
    super(records, codec, 'customers.CustomerAddress');
  }
  public async findByCustomer(customer: Customer): Promise<CustomerAddress[]> {
    return this.findByCustomerId(customer.id);
  }

  public async findByCustomerId(id: number): Promise<CustomerAddress[]> {
    return (await this.all()).filter(
      (item) => item.customer.id === id && item.isActive(),
    );
  }
}
