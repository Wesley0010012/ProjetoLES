import { TokenDto } from '../dto/output/TokenDto';
import { TokenDtoData } from '../dto/output/TokenDtoData';
import { User } from '../../domain/entities/User';

export const SESSION_MANAGER = 'SESSION_MANAGER';

export interface SessionManager {
  issue(user: User): TokenDto;
  get(token: string): TokenDtoData | null;
  remove(token: string): void;
}
