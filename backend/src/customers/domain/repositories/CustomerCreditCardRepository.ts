import { CrudRepository } from 'src/shared/domain/repositories/CrudRepository';
import { CustomerCreditCard } from '../entities/CustomerCreditCard';

export interface CustomerCreditCardRepository extends CrudRepository<CustomerCreditCard> {
  findByCustomerId(customerId: number): Promise<CustomerCreditCard[]>;
}
