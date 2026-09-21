import { Rule } from 'src/shared/application/protocols/rules/Rule';
import { Email } from 'src/shared/domain/vo/Email';
import { UsersRepository } from '../../domain/repositories/UsersRepository';
import { SignInDto } from '../dto/SignInDto';
import { SignInCredentials } from '../dto/input/SignInCredentials';
import { SessionManager } from '../protocols/SessionManager';
import { TokenDto } from '../dto/output/TokenDto';

export class SignIn {
  public constructor(
    private readonly users: UsersRepository,
    private readonly session: SessionManager,
    private readonly credentialsRule: Rule<SignInCredentials>,
  ) { }

  public async execute(input: SignInDto): Promise<TokenDto> {
    const user = await this.users.findByEmail(new Email(input.email));
    await this.credentialsRule.validate({
      user,
      password: input.password,
      type: input.type,
    });
    return this.session.issue(user!);
  }
}
