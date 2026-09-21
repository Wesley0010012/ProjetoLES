import { Rule } from 'src/shared/application/protocols/rules/Rule';
import { BadRequest } from 'src/shared/domain/errors/BadRequest';
import { MessageKeyEnum } from 'src/shared/domain/enums/MessageKeyEnum';
import { PasswordData } from '../usecases/UpdatePassword';

export class PasswordStrengthRule implements Rule<PasswordData> {
  public validate({ input }: PasswordData): Promise<void> {
    const password = input.password;
    if (
      password.length < 8 ||
      !/[A-Z]/.test(password) ||
      !/[a-z]/.test(password) ||
      !/[^A-Za-z0-9]/.test(password)
    ) {
      throw new BadRequest(MessageKeyEnum.WEAK_PASSWORD);
    }
    return Promise.resolve();
  }
}
