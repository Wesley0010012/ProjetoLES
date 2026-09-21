import { Repository } from 'typeorm';
import { DomainEntityCodec } from 'src/shared/infrastructure/persistence/postgres/DomainEntityCodec';
import { PersistedDomainEntity } from 'src/shared/infrastructure/persistence/postgres/PersistedDomainEntity';
import { PostgresAbstractEntityRepository } from 'src/shared/infrastructure/persistence/postgres/PostgresAbstractEntityRepository';
import { Customer } from '../../../domain/entities/Customer';
import { CustomerAddress } from '../../../domain/entities/CustomerAddress';
import { CustomerCreditCard } from '../../../domain/entities/CustomerCreditCard';
import { CustomerRepository } from '../../../domain/repositories/CustomerRepository';
import { CustomerAddressRepository } from '../../../domain/repositories/CustomerAddressRepository';
import { CustomerCreditCardRepository } from '../../../domain/repositories/CustomerCreditCardRepository';

export class PostgresCustomerRepository
  extends PostgresAbstractEntityRepository<Customer>
  implements CustomerRepository {
  public constructor(
    records: Repository<PersistedDomainEntity>,
    codec: DomainEntityCodec,
  ) {
    super(records, codec, 'customers.Customer');
  }
  protected override matchesSearch(customer: Customer): boolean {
    return customer.isActive() && customer.user.isActive();
  }
  public async existsByDocument(
    document: string,
    ignoredId?: number,
  ): Promise<boolean> {
    return (await this.all()).some(
      (item) => item.id !== ignoredId && item.document.number === document,
    );
  }

  public async findByUserId(userId: number): Promise<Customer | null> {
    return (await this.all()).find((item) => item.user.id === userId) ?? null;
  }
}

