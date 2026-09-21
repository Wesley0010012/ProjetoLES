import { Rule } from 'src/shared/application/protocols/rules/Rule';
import { BadRequest } from 'src/shared/domain/errors/BadRequest';
import { MessageKeyEnum } from 'src/shared/domain/enums/MessageKeyEnum';
import { User } from 'src/users/domain/entities/User';
import { UserType } from 'src/users/domain/enums/UserType';
export class CustomerUserRule implements Rule<User> {
  public validate(user: User): Promise<void> {
    if (!user.isActive() || !user.isType(UserType.USER))
      throw new BadRequest(MessageKeyEnum.INVALID_OR_INACTIVE_USER);
    return Promise.resolve();
  }
}
