import { CrudRepository } from 'src/shared/domain/repositories/CrudRepository';
import { Author } from '../entities/Author';

export interface AuthorRepository extends CrudRepository<Author> {}
