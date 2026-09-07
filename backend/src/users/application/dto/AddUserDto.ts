import { AddInput } from 'src/shared/application/dto/input/AddInput';
import { Email } from 'src/shared/domain/vo/Email';
import { UserType } from '../../domain/enums/UserType';

export class AddUserDto extends AddInput {
  public constructor(
    public readonly email: Email,
    public readonly type: UserType,
  ) {
    super();
  }
}
