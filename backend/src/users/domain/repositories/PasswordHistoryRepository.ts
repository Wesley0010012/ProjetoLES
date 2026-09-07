import { AddRepository } from 'src/shared/domain/repositories/protocols/AddRepository';
import { PasswordHistory } from '../entities/PasswordHistory';
import { User } from '../entities/User';

export const PASSWORD_HISTORY_REPOSITORY = 'PASSWORD_HISTORY_REPOSITORY';

export interface PasswordHistoryRepository extends AddRepository<PasswordHistory> {
  /** The two previous passwords, newest first; the current password lives on User. */
  findByUser(user: User): Promise<PasswordHistory[]>;
}
