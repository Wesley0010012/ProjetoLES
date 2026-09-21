import { UpdateRepository } from 'src/shared/domain/repositories/protocols/UpdateRepository';
import { AddRepository } from 'src/shared/domain/repositories/protocols/AddRepository';
import { FindByIdRepository } from 'src/shared/domain/repositories/protocols/FindByIdRepository';
import { Email } from 'src/shared/domain/vo/Email';
import { User } from '../entities/User';

export interface UsersRepository
  extends
    AddRepository<User>,
    FindByIdRepository<User>,
    UpdateRepository<User> {
  findByEmail(email: Email): Promise<User | null>;
  existsByEmail(email: Email): Promise<boolean>;
}
