import { Repository } from 'typeorm';
import { DomainEntityCodec } from 'src/shared/infrastructure/persistence/postgres/DomainEntityCodec';
import { PersistedDomainEntity } from 'src/shared/infrastructure/persistence/postgres/PersistedDomainEntity';
import { PostgresAbstractEntityRepository } from 'src/shared/infrastructure/persistence/postgres/PostgresAbstractEntityRepository';
import { PasswordHistory } from '../../../domain/entities/PasswordHistory';
import { User } from '../../../domain/entities/User';
import { PasswordHistoryRepository } from '../../../domain/repositories/PasswordHistoryRepository';

export class PostgresPasswordHistoryRepository
  extends PostgresAbstractEntityRepository<PasswordHistory>
  implements PasswordHistoryRepository
{
  public constructor(
    records: Repository<PersistedDomainEntity>,
    codec: DomainEntityCodec,
  ) {
    super(records, codec, 'users.PasswordHistory');
  }

  public async add(entry: PasswordHistory): Promise<void> {
    await super.add(entry);
    const entries = (await this.all())
      .filter((item) => item.user.id === entry.user.id)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    for (const obsolete of entries.slice(2)) {
      await this.records.delete({
        kind: 'users.PasswordHistory',
        domainId: obsolete.id,
      });
    }
  }

  public async findByUser(user: User): Promise<PasswordHistory[]> {
    return (await this.all()).filter((entry) => entry.user.id === user.id);
  }
}
