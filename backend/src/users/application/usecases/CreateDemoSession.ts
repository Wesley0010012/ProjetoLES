import { Rule } from 'src/shared/application/protocols/rules/Rule';
import { MessageKeyEnum } from 'src/shared/domain/enums/MessageKeyEnum';
import { Unauthorized } from 'src/shared/domain/errors/Unauthorized';
import { User } from '../../domain/entities/User';
import { UserType } from '../../domain/enums/UserType';
import { UsersRepository } from '../../domain/repositories/UsersRepository';
import { SessionManager } from '../protocols/SessionManager';

export class CreateDemoSession {
  public constructor(
    private readonly users: UsersRepository,
    private readonly session: SessionManager,
    private readonly activeUserRule: Rule<User>,
  ) {}

  public async execute(type: UserType) {
    const user = await this.users.findById(type === UserType.OPERATOR ? 2 : 1);

    if (!user) throw new Unauthorized(MessageKeyEnum.INVALID_OR_INACTIVE_USER);
    await this.activeUserRule.validate(user);

    return this.session.issue(user);
  }
}
