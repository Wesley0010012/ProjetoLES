import { CustomerCreditCardRepository } from './domain/repositories/CustomerCreditCardRepository';
import { CustomerAddressRepository } from './domain/repositories/CustomerAddressRepository';
import { CustomerRepository } from './domain/repositories/CustomerRepository';
import { Repository } from 'typeorm';
import { Module } from '@nestjs/common';
import { SharedModule } from 'src/shared/shared.module';
import { UsersModule } from 'src/users/users.module';
import { USERS_REPOSITORY } from 'src/users/domain/repositories/UserRepositoryTokens';
import { UsersRepository } from 'src/users/domain/repositories/UsersRepository';
import {
  USER_USE_CASES,
  UserUseCases,
} from 'src/users/application/usecases/UserUseCases';
import { FindAll } from 'src/shared/application/usecases/FindAll';
import { FindEntityById } from 'src/shared/application/usecases/FindEntityById';
import { UpdateEntity } from 'src/shared/application/usecases/UpdateEntity';
import { AddEntity } from 'src/shared/application/usecases/AddEntity';
import { FindRequiredEntity } from 'src/shared/application/usecases/FindRequiredEntity';
import { RulesMap } from 'src/shared/application/protocols/rules/RulesMap';
import { EntityToCreatedEntityDto } from 'src/shared/application/protocols/mappers/EntityToCreatedEntityDto';
import { CreatedEntityDto } from 'src/shared/application/dto/output/CreatedEntityDto';
import { EntityPageToEntityPageDto } from 'src/shared/application/protocols/mappers/EntityPageToEntityPageDto';
import { UpdateCustomer } from './application/usecases/UpdateCustomer';
import { DeleteCustomer } from './application/usecases/DeleteCustomer';
import { CompleteCustomerProfile } from './application/usecases/CompleteCustomerProfile';
import { GetCustomerSelfProfile } from './application/usecases/GetCustomerSelfProfile';
import { ManageCustomerProfiles } from './application/usecases/ManageCustomerProfiles';
import { CustomerMapper } from './application/mappers/CustomerMapper';
import { CreditCardValidator } from './application/gateways/CreditCardValidator';
import { MockCreditCardValidator } from './infrastructure/gateways/MockCreditCardValidator';
import { InMemoryCustomerRepository } from './infrastructure/persistence/in-memory/InMemoryCustomerRepository';
import { InMemoryCustomerAddressRepository } from './infrastructure/persistence/in-memory/InMemoryCustomerAddressRepository';
import { InMemoryCustomerCreditCardRepository } from './infrastructure/persistence/in-memory/InMemoryCustomerCreditCardRepository';
import { createCustomersSeed } from './infrastructure/persistence/in-memory/CustomersSeed';
import {
  createAddressSeeds,
  createCardSeeds,
} from './infrastructure/persistence/in-memory/CustomerProfilesSeed';
import { CustomerSearch } from './application/CustomerSearch';
import { UpdateCustomerDto } from './application/dto/UpdateCustomerDto';
import { CustomerDto } from './application/dto/CustomerDto';
import { Customer } from './domain/entities/Customer';
import { CustomerAddress } from './domain/entities/CustomerAddress';
import { CustomerCreditCard } from './domain/entities/CustomerCreditCard';
import { CustomerDataRule } from './application/rules/CustomerDataRule';
import { UniqueCustomerDocumentRule } from './application/rules/UniqueCustomerDocumentRule';
import { CustomerUserRule } from './application/rules/CustomerUserRule';
import { CompleteCustomerProfileRule } from './application/rules/CompleteCustomerProfileRule';
import {
  AddCustomerAddressInput,
  AddCustomerCreditCardInput,
  AddCustomerInput,
} from './application/dto/AddCustomerProfileInputs';
import { AddCustomerMapper } from './application/mappers/AddCustomerMapper';
import { CustomerAddressMapper } from './application/mappers/CustomerAddressMapper';
import { CustomerCreditCardMapper } from './application/mappers/CustomerCreditCardMapper';
import { CustomersController } from './presentation/controllers/CustomersController';
import {
  CUSTOMER_USE_CASES,
  CustomerUseCases,
} from './presentation/controllers/CustomerUseCases';
import { CUSTOMER_PROFILE_USE_CASES } from './presentation/controllers/CustomerProfileUseCases';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PersistedDomainEntity } from 'src/shared/infrastructure/persistence/postgres/PersistedDomainEntity';
import { DomainEntityCodec } from 'src/shared/infrastructure/persistence/postgres/DomainEntityCodec';
import { PersistenceModule } from 'src/shared/infrastructure/persistence/postgres/PersistenceModule';
import { withReadCache } from 'src/shared/infrastructure/persistence/withReadCache';
import { PostgresCustomerRepository } from './infrastructure/persistence/postgres/PostgresCustomerRepositories';
import { PostgresCustomerAddressRepository } from './infrastructure/persistence/postgres/PostgresCustomerAddressRepository';
import { PostgresCustomerCreditCardRepository } from './infrastructure/persistence/postgres/PostgresCustomerCardsRepository';

@Module({
  imports: [SharedModule, UsersModule, PersistenceModule],
  controllers: [CustomersController],
  providers: [
    { provide: CreditCardValidator, useClass: MockCreditCardValidator },
    {
      provide: InMemoryCustomerRepository,
      inject: [
        getRepositoryToken(PersistedDomainEntity),
        DomainEntityCodec,
        USERS_REPOSITORY,
      ],
      useFactory: (
        records: Repository<PersistedDomainEntity>,
        codec: DomainEntityCodec,
        users: UsersRepository,
      ) => {
        const repository = new PostgresCustomerRepository(records, codec);
        return repository
          .seedIfEmpty(() => createCustomersSeed(users))
          .then((repo) => withReadCache(repo));
      },
    },
    {
      provide: InMemoryCustomerAddressRepository,
      inject: [
        getRepositoryToken(PersistedDomainEntity),
        DomainEntityCodec,
        InMemoryCustomerRepository,
      ],
      useFactory: (
        records: Repository<PersistedDomainEntity>,
        codec: DomainEntityCodec,
        customers: CustomerRepository,
      ) => {
        const repository = new PostgresCustomerAddressRepository(
          records,
          codec,
        );
        return repository
          .seedIfEmpty(async () =>
            createAddressSeeds(
              (await customers.findAll(new CustomerSearch())).entities,
            ),
          )
          .then((repo) => withReadCache(repo));
      },
    },
    {
      provide: InMemoryCustomerCreditCardRepository,
      inject: [
        getRepositoryToken(PersistedDomainEntity),
        DomainEntityCodec,
        InMemoryCustomerRepository,
      ],
      useFactory: (
        records: Repository<PersistedDomainEntity>,
        codec: DomainEntityCodec,
        customers: CustomerRepository,
      ) => {
        const repository = new PostgresCustomerCreditCardRepository(
          records,
          codec,
        );
        return repository
          .seedIfEmpty(async () =>
            createCardSeeds(
              (await customers.findAll(new CustomerSearch())).entities,
            ),
          )
          .then((repo) => withReadCache(repo));
      },
    },
    {
      provide: CUSTOMER_PROFILE_USE_CASES,
      inject: [
        InMemoryCustomerRepository,
        InMemoryCustomerAddressRepository,
        InMemoryCustomerCreditCardRepository,
        CreditCardValidator,
      ],
      useFactory: (
        customers: CustomerRepository,
        addresses: CustomerAddressRepository,
        cards: CustomerCreditCardRepository,
        validator: CreditCardValidator,
      ) => {
        const customersById = new FindRequiredEntity(customers);
        return new ManageCustomerProfiles(
          customers,
          addresses,
          cards,
          validator,
          new CustomerAddressMapper(customersById),
          new CustomerCreditCardMapper(customersById, cards, validator),
        );
      },
    },
    {
      provide: GetCustomerSelfProfile,
      inject: [
        USERS_REPOSITORY,
        InMemoryCustomerRepository,
        CUSTOMER_PROFILE_USE_CASES,
      ],
      useFactory: (
        users: UsersRepository,
        customers: CustomerRepository,
        profiles: ManageCustomerProfiles,
      ) =>
        new GetCustomerSelfProfile(
          users,
          customers,
          profiles,
          new CustomerMapper(),
        ),
    },
    {
      provide: CompleteCustomerProfile,
      inject: [
        USERS_REPOSITORY,
        InMemoryCustomerRepository,
        InMemoryCustomerAddressRepository,
        InMemoryCustomerCreditCardRepository,
        CreditCardValidator,
      ],
      useFactory: (
        users: UsersRepository,
        customers: CustomerRepository,
        addresses: CustomerAddressRepository,
        cards: CustomerCreditCardRepository,
        validator: CreditCardValidator,
      ) => {
        const customersById = new FindRequiredEntity(customers);
        const addCustomer = new AddEntity<
          Customer,
          AddCustomerInput,
          CreatedEntityDto
        >(
          new AddCustomerMapper(new FindRequiredEntity(users)),
          new RulesMap([
            new CustomerDataRule(),
            new UniqueCustomerDocumentRule(customers),
            {
              validate: (customer: Customer) =>
                new CustomerUserRule().validate(customer.user),
            },
          ]),
          customers,
          new EntityToCreatedEntityDto(),
        );
        const addAddress = new AddEntity<
          CustomerAddress,
          AddCustomerAddressInput,
          CreatedEntityDto
        >(
          new CustomerAddressMapper(customersById),
          new RulesMap([]),
          addresses,
          new EntityToCreatedEntityDto(),
        );
        const addCard = new AddEntity<
          CustomerCreditCard,
          AddCustomerCreditCardInput,
          CreatedEntityDto
        >(
          new CustomerCreditCardMapper(customersById, cards, validator),
          new RulesMap([]),
          cards,
          new EntityToCreatedEntityDto(),
        );
        return new CompleteCustomerProfile(
          users,
          new CompleteCustomerProfileRule(customers),
          addCustomer,
          addAddress,
          addCard,
        );
      },
    },
    {
      provide: CUSTOMER_USE_CASES,
      inject: [InMemoryCustomerRepository, USERS_REPOSITORY, USER_USE_CASES],
      useFactory: (
        customers: CustomerRepository,
        users: UsersRepository,
        userUseCases: UserUseCases,
      ): CustomerUseCases => {
        const mapper = new CustomerMapper();
        const update = new UpdateCustomer(
          customers,
          userUseCases.update,
          new UpdateEntity<Customer, UpdateCustomerDto, CustomerDto>(
            customers,
            mapper,
            new RulesMap([
              new CustomerDataRule(),
              new UniqueCustomerDocumentRule(customers),
            ]),
            customers,
            mapper,
          ),
        );
        const remove = new DeleteCustomer(customers, users);
        const find = new FindEntityById(customers, mapper);
        const list = new FindAll(
          customers,
          new EntityPageToEntityPageDto(mapper),
        );
        return {
          update: (input) => update.execute(input),
          delete: (id) => remove.execute(id),
          findById: (id) => find.execute(id),
          findAll: (search) => list.execute(search),
        };
      },
    },
  ],
  exports: [
    InMemoryCustomerRepository,
    InMemoryCustomerAddressRepository,
    InMemoryCustomerCreditCardRepository,
  ],
})
export class CustomersModule {}
