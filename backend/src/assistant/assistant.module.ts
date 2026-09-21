import { Module } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BooksModule } from 'src/books/books.module';
import { BOOK_USE_CASES } from 'src/books/presentation/controllers/BookUseCases';
import type { BookUseCases } from 'src/books/presentation/controllers/BookUseCases';
import { CustomersModule } from 'src/customers/customers.module';
import { CustomerDto } from 'src/customers/application/dto/CustomerDto';
import { CustomerMapper } from 'src/customers/application/mappers/CustomerMapper';
import { Customer } from 'src/customers/domain/entities/Customer';
import { CustomerRepository } from 'src/customers/domain/repositories/CustomerRepository';
import { InMemoryCustomerRepository } from 'src/customers/infrastructure/persistence/in-memory/InMemoryCustomerRepository';
import { CreatedEntityDto } from 'src/shared/application/dto/output/CreatedEntityDto';
import { EntityToCreatedEntityDto } from 'src/shared/application/protocols/mappers/EntityToCreatedEntityDto';
import { RulesMap } from 'src/shared/application/protocols/rules/RulesMap';
import { AddEntity } from 'src/shared/application/usecases/AddEntity';
import { FindEntityById } from 'src/shared/application/usecases/FindEntityById';
import { FindRequiredEntity } from 'src/shared/application/usecases/FindRequiredEntity';
import { DomainEntityCodec } from 'src/shared/infrastructure/persistence/postgres/DomainEntityCodec';
import { PersistedDomainEntity } from 'src/shared/infrastructure/persistence/postgres/PersistedDomainEntity';
import { PersistenceModule } from 'src/shared/infrastructure/persistence/postgres/PersistenceModule';
import { AddAssistantChatInput } from './application/dto/input/AddAssistantChatInput';
import { AddAssistantChatMessageInput } from './application/dto/input/AddAssistantChatMessageInput';
import { AssistantChatMapper } from './application/mappers/AssistantChatMapper';
import { AssistantChatMessageMapper } from './application/mappers/AssistantChatMessageMapper';
import { IAChatService } from './application/protocols/IAChatService';
import { SystemKnowledgeBase } from './application/SystemKnowledgeBase';
import { AskAssistant } from './application/usecases/AskAssistant';
import { AssistantChat } from './domain/entities/AssistantChat';
import { AssistantChatMessage } from './domain/entities/AssistantChatMessage';
import { AssistantChatRepository } from './domain/repositories/AssistantChatRepository';
import { AssistantChatMessageRepository } from './domain/repositories/AssistantChatMessageRepository';
import { GeminiIAChatService } from './infrastructure/ai/GeminiIAChatService';
import { InMemoryAssistantChatRepository } from './infrastructure/persistence/in-memory/InMemoryAssistantChatRepository';
import { InMemoryAssistantChatMessageRepository } from './infrastructure/persistence/in-memory/InMemoryAssistantChatMessageRepository';
import { PostgresAssistantChatRepository } from './infrastructure/persistence/postgres/PostgresAssistantChatRepository';
import { PostgresAssistantChatMessageRepository } from './infrastructure/persistence/postgres/PostgresAssistantChatMessageRepository';
import { AssistantController } from './presentation/controllers/AssistantController';

@Module({
  imports: [BooksModule, CustomersModule, PersistenceModule],
  controllers: [AssistantController],
  providers: [
    SystemKnowledgeBase,
    {
      provide: InMemoryAssistantChatRepository,
      inject: [getRepositoryToken(PersistedDomainEntity), DomainEntityCodec],
      useFactory: (
        records: Repository<PersistedDomainEntity>,
        codec: DomainEntityCodec,
      ) => new PostgresAssistantChatRepository(records, codec),
    },
    {
      provide: InMemoryAssistantChatMessageRepository,
      inject: [getRepositoryToken(PersistedDomainEntity), DomainEntityCodec],
      useFactory: (
        records: Repository<PersistedDomainEntity>,
        codec: DomainEntityCodec,
      ) => new PostgresAssistantChatMessageRepository(records, codec),
    },
    {
      provide: 'IAChatService',
      useFactory: () =>
        new GeminiIAChatService(
          process.env['GEMINI_API_KEY']?.trim() ?? '',
          process.env['GEMINI_MODEL'] ?? 'gemini-flash-latest',
          process.env['GEMINI_BASE_URL'] ??
            'https://generativelanguage.googleapis.com/v1beta',
        ),
    },
    {
      provide: AskAssistant,
      inject: [
        BOOK_USE_CASES,
        InMemoryCustomerRepository,
        InMemoryAssistantChatRepository,
        InMemoryAssistantChatMessageRepository,
        SystemKnowledgeBase,
        'IAChatService',
      ],
      useFactory: (
        books: BookUseCases,
        customers: CustomerRepository,
        chats: AssistantChatRepository,
        messages: AssistantChatMessageRepository,
        knowledge: SystemKnowledgeBase,
        iaChatService: IAChatService,
      ) => {
        const findCustomerById = new FindEntityById<Customer, CustomerDto>(
          customers,
          new CustomerMapper(),
        );
        const addChat = new AddEntity<
          AssistantChat,
          AddAssistantChatInput,
          CreatedEntityDto
        >(
          new AssistantChatMapper(new FindRequiredEntity(customers)),
          new RulesMap([]),
          chats,
          new EntityToCreatedEntityDto(),
        );
        const messageMapper = new AssistantChatMessageMapper(
          new FindRequiredEntity(chats),
        );
        const addMessage = new AddEntity<
          AssistantChatMessage,
          AddAssistantChatMessageInput,
          CreatedEntityDto
        >(
          messageMapper,
          new RulesMap([]),
          messages,
          new EntityToCreatedEntityDto(),
        );

        return new AskAssistant(
          books,
          customers,
          findCustomerById,
          chats,
          messages,
          addChat,
          addMessage,
          messageMapper,
          knowledge,
          iaChatService,
        );
      },
    },
  ],
})
export class AssistantModule {}
