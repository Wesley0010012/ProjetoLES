import { Email } from 'src/shared/domain/vo/Email';
import { InMemoryAbstractEntityRepository } from 'src/shared/infrastructure/persistence/in-memory/InMemoryAbstractEntityRepository';
import { User } from '../../../domain/entities/User';
import { UsersRepository } from '../../../domain/repositories/UsersRepository';
import { createUsersSeed } from './UsersSeed';

export class InMemoryUsersRepository
  extends InMemoryAbstractEntityRepository<User>
  implements UsersRepository
{
  protected override seed(): void {
    this._entities.push(...createUsersSeed());
  }

  public existsByEmail(email: Email): Promise<boolean> {
    return Promise.resolve(
      this._entities.some((user) => user.email.address === email.address),
    );
  }
}
