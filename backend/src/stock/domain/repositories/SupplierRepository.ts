import { CrudRepository } from 'src/shared/domain/repositories/CrudRepository';
import { Supplier } from '../entities/Supplier';

export interface SupplierRepository extends CrudRepository<Supplier> {}
