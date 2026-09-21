import { Rule } from 'src/shared/application/protocols/rules/Rule';
import { Validator } from 'src/shared/domain/protocols/cryptography/Validator';
import { BadRequest } from 'src/shared/domain/errors/BadRequest';
import { MessageKeyEnum } from 'src/shared/domain/enums/MessageKeyEnum';
import { PasswordHistoryRepository } from '../../domain/repositories/PasswordHistoryRepository';
import { UpdatePasswordData } from '../usecases/UpdatePassword';

export class PasswordUsedBeforeRule implements Rule<UpdatePasswordData> {
  public constructor(
    private readonly repository: PasswordHistoryRepository,
    private readonly validator: Validator,
  ) {}

  public async validate({ user, input }: UpdatePasswordData): Promise<void> {
    const history = await this.repository.findByUser(user);
    const passwords = history.map((entry) => entry.password);
    if (user.password) passwords.unshift(user.password);
    for (const password of passwords) {
      if (await this.validator.validate(input.password, password)) {
        throw new BadRequest(MessageKeyEnum.PASSWORD_ALREADY_USED);
      }
    }
  }
}
