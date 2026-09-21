import { Repository } from 'typeorm';
import { DomainEntityCodec } from 'src/shared/infrastructure/persistence/postgres/DomainEntityCodec';
import { PersistedDomainEntity } from 'src/shared/infrastructure/persistence/postgres/PersistedDomainEntity';
import { PostgresAbstractEntityRepository } from 'src/shared/infrastructure/persistence/postgres/PostgresAbstractEntityRepository';
import { Email } from 'src/shared/domain/vo/Email';
import { User } from '../../../domain/entities/User';
import { UsersRepository } from '../../../domain/repositories/UsersRepository';

export class PostgresUsersRepository
  extends PostgresAbstractEntityRepository<User>
  implements UsersRepository
{
  public constructor(
    records: Repository<PersistedDomainEntity>,
    codec: DomainEntityCodec,
  ) {
    super(records, codec, 'users.User');
  }

  public async findByEmail(email: Email): Promise<User | null> {
    return (
      (await this.all()).find((user) => user.email.address === email.address) ??
      null
    );
  }

  public async existsByEmail(email: Email): Promise<boolean> {
    return (await this.findByEmail(email)) !== null;
  }
}
