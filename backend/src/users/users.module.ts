import {
  PasswordHistoryRepository,
  PASSWORD_HISTORY_REPOSITORY,
} from './domain/repositories/PasswordHistoryRepository';
import { InMemoryPasswordHistoryRepository } from './infrastructure/persistence/in-memory/InMemoryPasswordHistoryRepository';
import { PasswordStrengthRule } from './application/rules/PasswordStrengthRule';
import { PasswordUsedBeforeRule } from './application/rules/PasswordUsedBeforeRule';
import { PasswordConfirmationRule } from './application/rules/PasswordConfirmationRule';
import { ActiveUserRule } from './application/rules/ActiveUserRule';
import { UpdatePassword } from './application/usecases/UpdatePassword';
import { ScryptAdapter } from 'src/shared/infrastructure/cryptography/ScryptAdapter';
import { Module } from '@nestjs/common';
import { RulesMap } from 'src/shared/application/protocols/rules/RulesMap';
import { AddEntity } from 'src/shared/application/usecases/AddEntity';
import { FindEntityById } from 'src/shared/application/usecases/FindEntityById';
import { SharedModule } from 'src/shared/shared.module';
import { UniqueEmail } from './application/rules/UniqueEmail';
import {
  USER_USE_CASES,
  UserUseCases,
} from './application/usecases/UserUseCases';
import { USERS_REPOSITORY } from './domain/repositories/UserRepositoryTokens';
import { UsersRepository } from './domain/repositories/UsersRepository';
import { AddUserDtoToUser } from './infrastructure/mappers/AddUserDtoToUser';
import { UserToUserDto } from './infrastructure/mappers/UserToUserDto';
import { InMemoryUsersRepository } from './infrastructure/persistence/in-memory/InMemoryUsersRepository';
import { UsersController } from './presentation/controllers/UsersController';

@Module({
  imports: [SharedModule],
  controllers: [UsersController],
  providers: [
    {
      provide: PASSWORD_HISTORY_REPOSITORY,
      useClass: InMemoryPasswordHistoryRepository,
    },
    { provide: USERS_REPOSITORY, useClass: InMemoryUsersRepository },
    {
      provide: USER_USE_CASES,
      inject: [USERS_REPOSITORY, ScryptAdapter, PASSWORD_HISTORY_REPOSITORY],
      useFactory: (
        repository: UsersRepository,
        cryptography: ScryptAdapter,
        historyRepository: PasswordHistoryRepository,
      ): UserUseCases => {
        const mapper = new UserToUserDto();
        return {
          updatePassword: new UpdatePassword(
            repository,
            cryptography,
            historyRepository,
            new RulesMap([
              new ActiveUserRule(),
              new PasswordConfirmationRule(),
              new PasswordStrengthRule(),
              new PasswordUsedBeforeRule(historyRepository, cryptography),
            ]),
          ),
          add: new AddEntity(
            new AddUserDtoToUser(),
            new RulesMap([new UniqueEmail(repository)]),
            repository,
            mapper,
          ),
          findById: new FindEntityById(repository, mapper),
        };
      },
    },
  ],
  exports: [USERS_REPOSITORY, USER_USE_CASES, PASSWORD_HISTORY_REPOSITORY],
})
export class UsersModule {}
