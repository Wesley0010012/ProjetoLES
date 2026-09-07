import { Rule } from 'src/shared/application/protocols/rules/Rule';
import { BadRequest } from 'src/shared/domain/errors/BadRequest';
import { MessageKeyEnum } from 'src/shared/domain/enums/MessageKeyEnum';
import { UpdatePasswordData } from './UpdatePasswordData';

export class ActiveUserRule implements Rule<UpdatePasswordData> {
  public validate({ user }: UpdatePasswordData): Promise<void> {
    if (!user.isActive())
      throw new BadRequest(MessageKeyEnum.INVALID_OR_INACTIVE_USER);
    return Promise.resolve();
  }
}
