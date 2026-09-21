import { User } from '../../../domain/entities/User';
import { UserType } from '../../../domain/enums/UserType';

export type SignInCredentials = {
  user?: User | null;
  password: string;
  type: UserType;
};
