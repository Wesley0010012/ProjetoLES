import { Rule } from 'src/shared/application/protocols/rules/Rule';
import { BadRequest } from 'src/shared/domain/errors/BadRequest';
import { MessageKeyEnum } from 'src/shared/domain/enums/MessageKeyEnum';
import { UpdatePasswordData } from './UpdatePasswordData';

export class PasswordConfirmationRule implements Rule<UpdatePasswordData> {
  public validate({ input }: UpdatePasswordData): Promise<void> {
    if (input.password !== input.passwordConfirmation)
      throw new BadRequest(MessageKeyEnum.PASSWORDS_DO_NOT_MATCH);
    return Promise.resolve();
  }
}
