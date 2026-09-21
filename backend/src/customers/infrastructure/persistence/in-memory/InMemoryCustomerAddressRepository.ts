import { CustomerAddress } from 'src/customers/domain/entities/CustomerAddress';
import { Customer } from 'src/customers/domain/entities/Customer';
import { CustomerAddressRepository } from 'src/customers/domain/repositories/CustomerAddressRepository';
import { InMemoryAbstractEntityRepository } from 'src/shared/infrastructure/persistence/in-memory/InMemoryAbstractEntityRepository';

export class InMemoryCustomerAddressRepository
  extends InMemoryAbstractEntityRepository<CustomerAddress>
  implements CustomerAddressRepository
{
  public constructor(seed: CustomerAddress[] = []) {
    super();
    this._entities.push(...seed);
  }

  public findByCustomerId(id: number): Promise<CustomerAddress[]> {
    return Promise.resolve(
      this._entities.filter(
        (address) => address.customer.id === id && address.isActive(),
      ),
    );
  }

  public findByCustomer(customer: Customer): Promise<CustomerAddress[]> {
    return this.findByCustomerId(customer.id);
  }
}
