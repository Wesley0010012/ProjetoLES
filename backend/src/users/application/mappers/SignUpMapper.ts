import { AddInputToEntity } from 'src/shared/application/protocols/mappers/AddInputToEntity';
import { MessageKeyEnum } from 'src/shared/domain/enums/MessageKeyEnum';
import { BadRequest } from 'src/shared/domain/errors/BadRequest';
import { Email } from 'src/shared/domain/vo/Email';
import { ScryptAdapter } from 'src/shared/infrastructure/cryptography/ScryptAdapter';
import { User } from '../../domain/entities/User';
import { UserType } from '../../domain/enums/UserType';
import { PasswordConfirmationRule } from '../../application/rules/PasswordConfirmationRule';
import { PasswordStrengthRule } from '../../application/rules/PasswordStrengthRule';
import { SignUpInput } from '../../application/dto/SignUpInput';

export class SignUpMapper implements AddInputToEntity<SignUpInput, User> {
  public constructor(private readonly cryptography: ScryptAdapter) {}

  public async toEntity(input: SignUpInput): Promise<User> {
    await new PasswordConfirmationRule().validate({ input });
    await new PasswordStrengthRule().validate({ input });
    const password = await this.cryptography.encrypt(input.password);
    try {
      return new User({
        email: new Email(input.email),
        type: UserType.USER,
        password,
      });
    } catch {
      throw new BadRequest(MessageKeyEnum.INVALID_PARAM, { param: 'email' });
    }
  }
}
