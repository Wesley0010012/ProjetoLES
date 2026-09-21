import { CrudRepository } from 'src/shared/domain/repositories/CrudRepository';
import { Sale } from '../entities/Sale';

export interface SaleRepository extends CrudRepository<Sale> {
  nextCode(): string;
}
