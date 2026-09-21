import { Repository } from 'typeorm';
import { Category } from '../../../domain/entities/Category';
import { CategoryRepository } from '../../../domain/repositories/CategoryRepository';
import { DomainEntityCodec } from 'src/shared/infrastructure/persistence/postgres/DomainEntityCodec';
import { PersistedDomainEntity } from 'src/shared/infrastructure/persistence/postgres/PersistedDomainEntity';
import { ActiveCatalogRepository } from './ActiveCatalogRepository';

export class PostgresCategoriesRepository
  extends ActiveCatalogRepository<Category>
  implements CategoryRepository
{
  public constructor(
    records: Repository<PersistedDomainEntity>,
    codec: DomainEntityCodec,
  ) {
    super(records, codec, 'books.Category');
  }
}
