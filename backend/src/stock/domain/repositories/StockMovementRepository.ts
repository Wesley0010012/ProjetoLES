import { CrudRepository } from 'src/shared/domain/repositories/CrudRepository';
import { StockMovement } from '../entities/StockMovement';

export interface StockMovementRepository extends CrudRepository<StockMovement> {}
