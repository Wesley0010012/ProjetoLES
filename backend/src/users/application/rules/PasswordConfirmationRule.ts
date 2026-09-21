import { Rule } from 'src/shared/application/protocols/rules/Rule';
import { BadRequest } from 'src/shared/domain/errors/BadRequest';
import { MessageKeyEnum } from 'src/shared/domain/enums/MessageKeyEnum';
import { PasswordData } from '../usecases/UpdatePassword';

export class PasswordConfirmationRule implements Rule<PasswordData> {
  public validate({ input }: PasswordData): Promise<void> {
    if (input.password !== input.passwordConfirmation)
      throw new BadRequest(MessageKeyEnum.PASSWORDS_DO_NOT_MATCH);
    return Promise.resolve();
  }
}
