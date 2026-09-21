import { Repository } from 'typeorm';
import { PrecificationGroup } from '../../../domain/entities/PrecificationGroup';
import { PrecificationGroupRepository } from '../../../domain/repositories/PrecificationGroupRepository';
import { DomainEntityCodec } from 'src/shared/infrastructure/persistence/postgres/DomainEntityCodec';
import { PersistedDomainEntity } from 'src/shared/infrastructure/persistence/postgres/PersistedDomainEntity';
import { ActiveCatalogRepository } from './ActiveCatalogRepository';

export class PostgresPrecificationGroupsRepository
  extends ActiveCatalogRepository<PrecificationGroup>
  implements PrecificationGroupRepository
{
  public constructor(
    records: Repository<PersistedDomainEntity>,
    codec: DomainEntityCodec,
  ) {
    super(records, codec, 'books.PrecificationGroup');
  }
}
