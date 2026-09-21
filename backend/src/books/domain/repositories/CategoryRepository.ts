import { CrudRepository } from 'src/shared/domain/repositories/CrudRepository';
import { Category } from '../entities/Category';

export interface CategoryRepository extends CrudRepository<Category> {}
