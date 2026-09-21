import {
  PasswordHistoryRepository,
  PASSWORD_HISTORY_REPOSITORY,
} from './domain/repositories/PasswordHistoryRepository';
import { PasswordStrengthRule } from './application/rules/PasswordStrengthRule';
import { PasswordUsedBeforeRule } from './application/rules/PasswordUsedBeforeRule';
import { PasswordConfirmationRule } from './application/rules/PasswordConfirmationRule';
import { ActiveUserRule } from './application/rules/ActiveUserRule';
import { SignInCredentialsRule } from './application/rules/SignInCredentialsRule';
import {
  UpdatePassword,
  UpdatePasswordData,
} from './application/usecases/UpdatePassword';
import { ScryptAdapter } from 'src/shared/infrastructure/cryptography/ScryptAdapter';
import { Module } from '@nestjs/common';
import { RulesMap } from 'src/shared/application/protocols/rules/RulesMap';
import { AddEntity } from 'src/shared/application/usecases/AddEntity';
import { FindEntityById } from 'src/shared/application/usecases/FindEntityById';
import { SharedModule } from 'src/shared/shared.module';
import {
  SESSION_MANAGER,
  SessionManager,
} from './application/protocols/SessionManager';
import {
  USER_USE_CASES,
  UserUseCases,
} from './application/usecases/UserUseCases';
import { USERS_REPOSITORY } from './domain/repositories/UserRepositoryTokens';
import { UsersRepository } from './domain/repositories/UsersRepository';
import { SignUpMapper } from './application/mappers/SignUpMapper';
import { UpdateUserMapper } from './application/mappers/UpdateUserMapper';
import { UpdateEntity } from 'src/shared/application/usecases/UpdateEntity';
import { EntityToCreatedEntityDto } from 'src/shared/application/protocols/mappers/EntityToCreatedEntityDto';
import { UniqueUserEmailRule } from './application/rules/UniqueUserEmailRule';
import { InMemorySessionManager } from './infrastructure/session/InMemorySessionManager';
import { SignIn } from './application/usecases/SignIn';
import { CreateDemoSession } from './application/usecases/CreateDemoSession';
import { ValidateSession } from './application/usecases/ValidateSession';
import { AuthenticationGuard } from './presentation/guards/AuthenticationGuard';
import { APP_GUARD } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PersistenceModule } from 'src/shared/infrastructure/persistence/postgres/PersistenceModule';
import { withReadCache } from 'src/shared/infrastructure/persistence/withReadCache';
import { PersistedDomainEntity } from 'src/shared/infrastructure/persistence/postgres/PersistedDomainEntity';
import { DomainEntityCodec } from 'src/shared/infrastructure/persistence/postgres/DomainEntityCodec';
import { PostgresUsersRepository } from './infrastructure/persistence/postgres/PostgresUsersRepository';
import { PostgresPasswordHistoryRepository } from './infrastructure/persistence/postgres/PostgresPasswordHistoryRepository';
import { createUsersSeed } from './infrastructure/persistence/in-memory/UsersSeed';
import { UserToUserDto } from './application/mappers/UserToUserDto';
import { UsersController } from './presentation/controllers/UsersController';
import { MessageKeyEnum } from 'src/shared/domain/enums/MessageKeyEnum';
import { Unauthorized } from 'src/shared/domain/errors/Unauthorized';

@Module({
  imports: [SharedModule, PersistenceModule],
  controllers: [UsersController],
  providers: [
    {
      provide: PASSWORD_HISTORY_REPOSITORY,
      inject: [getRepositoryToken(PersistedDomainEntity), DomainEntityCodec],
      useFactory: (
        records: Repository<PersistedDomainEntity>,
        codec: DomainEntityCodec,
      ) => new PostgresPasswordHistoryRepository(records, codec),
    },
    {
      provide: USERS_REPOSITORY,
      inject: [getRepositoryToken(PersistedDomainEntity), DomainEntityCodec],
      useFactory: (
        records: Repository<PersistedDomainEntity>,
        codec: DomainEntityCodec,
      ) => {
        const repository = new PostgresUsersRepository(records, codec);
        return repository
          .seedIfEmpty(createUsersSeed)
          .then((repo) => withReadCache(repo));
      },
    },
    {
      provide: SESSION_MANAGER,
      useClass: InMemorySessionManager,
    },
    {
      provide: SignIn,
      inject: [USERS_REPOSITORY, ScryptAdapter, SESSION_MANAGER],
      useFactory: (
        users: UsersRepository,
        crypto: ScryptAdapter,
        session: SessionManager,
      ) => new SignIn(users, session, new SignInCredentialsRule(crypto)),
    },
    {
      provide: CreateDemoSession,
      inject: [USERS_REPOSITORY, SESSION_MANAGER],
      useFactory: (users: UsersRepository, session: SessionManager) =>
        new CreateDemoSession(
          users,
          session,
          new ActiveUserRule(
            () => new Unauthorized(MessageKeyEnum.INVALID_OR_INACTIVE_USER),
          ),
        ),
    },
    {
      provide: ValidateSession,
      inject: [USERS_REPOSITORY, SESSION_MANAGER],
      useFactory: (users: UsersRepository, session: SessionManager) =>
        new ValidateSession(users, session),
    },
    { provide: APP_GUARD, useClass: AuthenticationGuard },
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
            new RulesMap<UpdatePasswordData>([
              new ActiveUserRule(),
              new PasswordConfirmationRule(),
              new PasswordStrengthRule(),
              new PasswordUsedBeforeRule(historyRepository, cryptography),
            ]),
          ),
          signUp: new AddEntity(
            new SignUpMapper(cryptography),
            new RulesMap([new UniqueUserEmailRule(repository)]),
            repository,
            new EntityToCreatedEntityDto(),
          ),
          update: new UpdateEntity(
            repository,
            new UpdateUserMapper(),
            new RulesMap([new UniqueUserEmailRule(repository)]),
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
