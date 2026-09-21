import { randomBytes } from 'node:crypto';
import { TokenDto } from '../../application/dto/output/TokenDto';
import { TokenDtoData } from '../../application/dto/output/TokenDtoData';
import { SessionManager } from '../../application/protocols/SessionManager';
import { User } from '../../domain/entities/User';

export class InMemorySessionManager implements SessionManager {
  private readonly sessions = new Map<string, TokenDtoData>();

  public issue(user: User): TokenDto {
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000);
    this.sessions.set(token, new TokenDtoData(user.id, expiresAt));
    return new TokenDto(token, user.id, expiresAt);
  }

  public get(token: string): TokenDtoData | null {
    const session = this.sessions.get(token);
    if (!session || session.expiresAt.getTime() <= Date.now()) {
      this.sessions.delete(token);
      return null;
    }
    return session;
  }

  public remove(token: string): void {
    this.sessions.delete(token);
  }
}
