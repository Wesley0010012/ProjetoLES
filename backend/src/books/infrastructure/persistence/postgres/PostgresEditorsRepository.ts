import { Repository } from 'typeorm';
import { Editor } from '../../../domain/entities/Editor';
import { EditorRepository } from '../../../domain/repositories/EditorRepository';
import { DomainEntityCodec } from 'src/shared/infrastructure/persistence/postgres/DomainEntityCodec';
import { PersistedDomainEntity } from 'src/shared/infrastructure/persistence/postgres/PersistedDomainEntity';
import { ActiveCatalogRepository } from './ActiveCatalogRepository';

export class PostgresEditorsRepository
  extends ActiveCatalogRepository<Editor>
  implements EditorRepository
{
  public constructor(
    records: Repository<PersistedDomainEntity>,
    codec: DomainEntityCodec,
  ) {
    super(records, codec, 'books.Editor');
  }
}
