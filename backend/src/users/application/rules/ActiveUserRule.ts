import { Rule } from 'src/shared/application/protocols/rules/Rule';
import { MessageKeyEnum } from 'src/shared/domain/enums/MessageKeyEnum';
import { BadRequest } from 'src/shared/domain/errors/BadRequest';
import { CustomError } from 'src/shared/domain/errors/CustomError';
import { User } from '../../domain/entities/User';

type ActiveUserData = User | { user: User };

export class ActiveUserRule implements Rule<ActiveUserData> {
  public constructor(
    private readonly errorFactory: () => CustomError = () =>
      new BadRequest(MessageKeyEnum.INVALID_OR_INACTIVE_USER),
  ) {}

  public validate(data: ActiveUserData): Promise<void> {
    const user = data instanceof User ? data : data.user;
    if (!user.isActive()) {
      throw this.errorFactory();
    }
    return Promise.resolve();
  }
}
