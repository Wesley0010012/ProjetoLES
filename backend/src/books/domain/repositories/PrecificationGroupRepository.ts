import { CrudRepository } from 'src/shared/domain/repositories/CrudRepository';
import { PrecificationGroup } from '../entities/PrecificationGroup';

export interface PrecificationGroupRepository extends CrudRepository<PrecificationGroup> {}
