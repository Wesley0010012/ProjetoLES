import { Rule } from 'src/shared/application/protocols/rules/Rule';
import { Validator } from 'src/shared/domain/protocols/cryptography/Validator';
import { MessageKeyEnum } from 'src/shared/domain/enums/MessageKeyEnum';
import { Unauthenticated } from 'src/shared/domain/errors/Unauthenticated';
import { SignInCredentials } from '../dto/input/SignInCredentials';

export class SignInCredentialsRule implements Rule<SignInCredentials> {
  public constructor(private readonly cryptography: Validator) {}

  public async validate(data: SignInCredentials): Promise<void> {
    const { user, password, type } = data;
    if (
      !user?.isActive() ||
      !user.isType(type) ||
      !user.password ||
      !(await this.cryptography.validate(password, user.password))
    ) {
      throw new Unauthenticated(MessageKeyEnum.INVALID_EMAIL_OR_PASSWORD);
    }
  }
}
