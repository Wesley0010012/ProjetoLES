import { Rule } from 'src/shared/application/protocols/rules/Rule';
import { BadRequest } from 'src/shared/domain/errors/BadRequest';
import { MessageKeyEnum } from 'src/shared/domain/enums/MessageKeyEnum';
import { User } from 'src/users/domain/entities/User';
import { UsersRepository } from 'src/users/domain/repositories/UsersRepository';

export class UniqueEmail implements Rule<User> {
  private readonly _usersRepository: UsersRepository;

  public constructor(usersRepository: UsersRepository) {
    this._usersRepository = usersRepository;
  }

  public async validate(data: User): Promise<void> {
    if (await this._usersRepository.existsByEmail(data.email)) {
      throw new BadRequest(MessageKeyEnum.EMAIL_ALREADY_USED, {
        email: data.email.address,
      });
    }
  }
}
