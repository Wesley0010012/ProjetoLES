import { CrudRepository } from 'src/shared/domain/repositories/CrudRepository';
import { Book } from '../entities/Book';

export interface BookRepository extends CrudRepository<Book> {}
