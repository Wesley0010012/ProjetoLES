import { CrudRepository } from 'src/shared/domain/repositories/CrudRepository';
import { Customer } from '../entities/Customer';

export interface CustomerRepository extends CrudRepository<Customer> {
  existsByDocument(document: string, ignoredId?: number): Promise<boolean>;
  findByUserId(userId: number): Promise<Customer | null>;
}
