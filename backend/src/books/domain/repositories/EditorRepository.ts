import { CrudRepository } from 'src/shared/domain/repositories/CrudRepository';
import { Editor } from '../entities/Editor';

export interface EditorRepository extends CrudRepository<Editor> {}
