import { Encrypter } from 'src/shared/domain/protocols/cryptography/Encrypter';
import { NotFound } from 'src/shared/domain/errors/NotFound';
import { MessageKeyEnum } from 'src/shared/domain/enums/MessageKeyEnum';
import { RulesMap } from 'src/shared/application/protocols/rules/RulesMap';
import { PasswordHistory } from '../../domain/entities/PasswordHistory';
import { PasswordHistoryRepository } from '../../domain/repositories/PasswordHistoryRepository';
import { UsersRepository } from '../../domain/repositories/UsersRepository';
import { UpdatePasswordDto } from '../dto/UpdatePasswordDto';
import { User } from '../../domain/entities/User';

export type PasswordData = {
  input: { password: string; passwordConfirmation: string };
};

export type UpdatePasswordData = {
  user: User;
  input: UpdatePasswordDto;
};

export class UpdatePassword {
  public constructor(
    private readonly repository: UsersRepository,
    private readonly cryptography: Encrypter,
    private readonly historyRepository: PasswordHistoryRepository,
    private readonly rules: RulesMap<UpdatePasswordData>,
  ) {}

  public async execute(input: UpdatePasswordDto): Promise<void> {
    const user = await this.repository.findById(input.id);
    if (!user) {
      throw new NotFound(MessageKeyEnum.ENTITY_NOT_FOUND, { id: input.id });
    }

    await this.rules.validate({ user, input });
    const password = await this.cryptography.encrypt(input.password);

    if (user.password) {
      await this.historyRepository.add(
        new PasswordHistory({ user, password: user.password }),
      );
    }

    user.password = password;
    await this.repository.update(user);
  }
}
