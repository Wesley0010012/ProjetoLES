import { AddEntity } from 'src/shared/application/usecases/AddEntity';
import { FindEntityById } from 'src/shared/application/usecases/FindEntityById';
import { User } from '../../domain/entities/User';
import { AddUserDto } from '../dto/AddUserDto';
import { UserDto } from '../dto/UserDto';

import { UpdatePassword } from './UpdatePassword';

export const USER_USE_CASES = 'USER_USE_CASES';
export type UserUseCases = {
  updatePassword: UpdatePassword;
  add: AddEntity<User, AddUserDto, UserDto>;
  findById: FindEntityById<User, UserDto>;
};
