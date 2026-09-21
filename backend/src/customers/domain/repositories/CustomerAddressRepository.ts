import { CrudRepository } from 'src/shared/domain/repositories/CrudRepository';
import { CustomerAddress } from '../entities/CustomerAddress';
import { Customer } from '../entities/Customer';

export interface CustomerAddressRepository extends CrudRepository<CustomerAddress> {
  findByCustomer(customer: Customer): Promise<CustomerAddress[]>;
  findByCustomerId(customerId: number): Promise<CustomerAddress[]>;
}
