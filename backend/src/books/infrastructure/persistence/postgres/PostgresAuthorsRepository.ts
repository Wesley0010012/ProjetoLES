import { Repository } from 'typeorm';
import { Author } from '../../../domain/entities/Author';
import { AuthorRepository } from '../../../domain/repositories/AuthorRepository';
import { DomainEntityCodec } from 'src/shared/infrastructure/persistence/postgres/DomainEntityCodec';
import { PersistedDomainEntity } from 'src/shared/infrastructure/persistence/postgres/PersistedDomainEntity';
import { ActiveCatalogRepository } from './ActiveCatalogRepository';

export class PostgresAuthorsRepository
  extends ActiveCatalogRepository<Author>
  implements AuthorRepository
{
  public constructor(
    records: Repository<PersistedDomainEntity>,
    codec: DomainEntityCodec,
  ) {
    super(records, codec, 'books.Author');
  }
}
