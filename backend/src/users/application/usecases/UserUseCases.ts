import { FindEntityById } from 'src/shared/application/usecases/FindEntityById';
import { UpdateEntity } from 'src/shared/application/usecases/UpdateEntity';
import { User } from '../../domain/entities/User';
import { UpdateUserDto } from '../dto/UpdateUserDto';
import { UserDto } from '../dto/UserDto';
import { AddEntity } from 'src/shared/application/usecases/AddEntity';
import { SignUpInput } from '../dto/SignUpInput';
import { CreatedEntityDto } from 'src/shared/application/dto/output/CreatedEntityDto';

import { UpdatePassword } from './UpdatePassword';

export const USER_USE_CASES = 'USER_USE_CASES';
export type UserUseCases = {
  signUp: AddEntity<User, SignUpInput, CreatedEntityDto>;
  update: UpdateEntity<User, UpdateUserDto, UserDto>;
  updatePassword: UpdatePassword;
  findById: FindEntityById<User, UserDto>;
};
