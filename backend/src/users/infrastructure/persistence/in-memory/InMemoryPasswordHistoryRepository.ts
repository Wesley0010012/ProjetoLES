import { PasswordHistory } from '../../../domain/entities/PasswordHistory';
import { User } from '../../../domain/entities/User';
import { PasswordHistoryRepository } from '../../../domain/repositories/PasswordHistoryRepository';

export class InMemoryPasswordHistoryRepository implements PasswordHistoryRepository {
  private entries: PasswordHistory[] = [];
  private nextId = 1;

  public add(entry: PasswordHistory): Promise<void> {
    entry.id = this.nextId++;
    this.entries.unshift(entry);
    const retained = this.entries
      .filter((item) => item.user.id === entry.user.id)
      .slice(0, 2);
    this.entries = this.entries.filter(
      (item) => item.user.id !== entry.user.id || retained.includes(item),
    );
    return Promise.resolve();
  }

  public findByUser(user: User): Promise<PasswordHistory[]> {
    return Promise.resolve(
      this.entries.filter((entry) => entry.user.id === user.id),
    );
  }
}
