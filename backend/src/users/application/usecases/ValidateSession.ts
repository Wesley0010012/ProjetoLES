import { FindRequiredEntity } from 'src/shared/application/usecases/FindRequiredEntity';
import { MessageKeyEnum } from 'src/shared/domain/enums/MessageKeyEnum';
import { CustomError } from 'src/shared/domain/errors/CustomError';
import { Unauthenticated } from 'src/shared/domain/errors/Unauthenticated';
import { Unauthorized } from 'src/shared/domain/errors/Unauthorized';
import { User } from '../../domain/entities/User';
import { UsersRepository } from '../../domain/repositories/UsersRepository';
import { SessionManager } from '../protocols/SessionManager';

export class ValidateSession {
  public constructor(
    private readonly users: UsersRepository,
    private readonly session: SessionManager,
  ) {}

  public async execute(token: string): Promise<User> {
    const stored = this.session.get(token);

    if (!stored) {
      throw new Unauthenticated(MessageKeyEnum.INVALID_OR_INACTIVE_TOKEN);
    }

    const user = await this.findUser(stored.userId);

    if (!user.isActive()) {
      throw new Unauthorized(MessageKeyEnum.INVALID_OR_INACTIVE_USER);
    }

    return user;
  }

  private async findUser(userId: number): Promise<User> {
    try {
      return await new FindRequiredEntity(this.users).execute(userId);
    } catch (error) {
      if (
        error instanceof CustomError &&
        error.messageKey === MessageKeyEnum.ENTITY_NOT_FOUND
      ) {
        throw new Unauthorized(MessageKeyEnum.INVALID_OR_INACTIVE_USER);
      }
      throw error;
    }
  }
}
