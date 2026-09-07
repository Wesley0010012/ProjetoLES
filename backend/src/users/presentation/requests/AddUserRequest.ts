import { Request } from 'src/shared/presentation/requests/Request';
import { BadRequest } from 'src/shared/domain/errors/BadRequest';
import { MessageKeyEnum } from 'src/shared/domain/enums/MessageKeyEnum';
import { UserType } from '../../domain/enums/UserType';

export class AddUserRequest extends Request {
  public readonly emailAddress: string;
  public readonly type: UserType;

  public constructor(data: unknown) {
    super(data);
    this.emailAddress = this.email('email').trim().toLowerCase();
    if (this.emailAddress.length > 254) {
      throw new BadRequest(MessageKeyEnum.INVALID_PARAM, { param: 'email' });
    }
    this.type = this.enumValue('type', Object.values(UserType));
  }
}
