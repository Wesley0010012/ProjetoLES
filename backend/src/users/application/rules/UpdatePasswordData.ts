import { User } from '../../domain/entities/User';
import { UpdatePasswordDto } from '../dto/UpdatePasswordDto';

export type UpdatePasswordData = {
  user: User;
  input: UpdatePasswordDto;
};
