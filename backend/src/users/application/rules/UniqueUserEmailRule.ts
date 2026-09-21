import { Rule } from 'src/shared/application/protocols/rules/Rule';
import { MessageKeyEnum } from 'src/shared/domain/enums/MessageKeyEnum';
import { BadRequest } from 'src/shared/domain/errors/BadRequest';
import { User } from 'src/users/domain/entities/User';
import { UsersRepository } from 'src/users/domain/repositories/UsersRepository';

export class UniqueUserEmailRule implements Rule<User> {
  public constructor(private readonly users: UsersRepository) {}

  public async validate(user: User): Promise<void> {
    const existing = await this.users.findByEmail(user.email);
    if (existing && existing.id !== user.id) {
      throw new BadRequest(MessageKeyEnum.EMAIL_ALREADY_USED, {
        email: user.email.address,
      });
    }
  }
}
