import { CrudRepository } from 'src/shared/domain/repositories/CrudRepository';
import { ShoppingCart } from '../entities/ShoppingCart';

export interface ShoppingCartRepository extends CrudRepository<ShoppingCart> {
  findByCustomerId(customerId: number): Promise<ShoppingCart | null>;
}
