import {
  AbstractEntity,
  AbstractEntityProps,
} from 'src/shared/domain/entities/AbstractEntity';
import { User } from './User';

export type PasswordHistoryProps = AbstractEntityProps & {
  user: User;
  password: string;
};

export class PasswordHistory extends AbstractEntity<PasswordHistoryProps> {
  public get user(): User {
    return this._props.user;
  }
  public get password(): string {
    return this._props.password;
  }
}
