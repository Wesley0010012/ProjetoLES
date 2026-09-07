import {
  AbstractEntity,
  AbstractEntityProps,
} from 'src/shared/domain/entities/AbstractEntity';
import { Email } from 'src/shared/domain/vo/Email';
import { UserType } from '../enums/UserType';

export type UserProps = AbstractEntityProps & {
  email: Email;
  type: UserType;
  password?: string;
};

export class User extends AbstractEntity<UserProps> {
  public get password(): string | undefined {
    return this._props.password;
  }
  public changePassword(password: string): void {
    this._props.password = password;
    this.touch();
  }

  public get email(): Email {
    return this._props.email;
  }
  public get type(): UserType {
    return this._props.type;
  }
  public isType(type: UserType): boolean {
    return this.type === type;
  }
}
