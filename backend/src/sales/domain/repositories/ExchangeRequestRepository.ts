import { CrudRepository } from 'src/shared/domain/repositories/CrudRepository';
import { ExchangeRequest } from '../entities/ExchangeRequest';

export interface ExchangeRequestRepository extends CrudRepository<ExchangeRequest> {
  nextCode(): string;
}
