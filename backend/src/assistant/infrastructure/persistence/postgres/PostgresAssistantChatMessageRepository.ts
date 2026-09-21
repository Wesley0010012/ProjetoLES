import { Repository } from 'typeorm';
import { DomainEntityCodec } from 'src/shared/infrastructure/persistence/postgres/DomainEntityCodec';
import { PersistedDomainEntity } from 'src/shared/infrastructure/persistence/postgres/PersistedDomainEntity';
import { PostgresAbstractEntityRepository } from 'src/shared/infrastructure/persistence/postgres/PostgresAbstractEntityRepository';
import { AssistantChatMessage } from '../../../domain/entities/AssistantChatMessage';
import { AssistantChatMessageRepository } from '../../../domain/repositories/AssistantChatMessageRepository';

export class PostgresAssistantChatMessageRepository
  extends PostgresAbstractEntityRepository<AssistantChatMessage>
  implements AssistantChatMessageRepository
{
  public constructor(
    records: Repository<PersistedDomainEntity>,
    codec: DomainEntityCodec,
  ) {
    super(records, codec, 'assistant.AssistantChatMessage');
  }

  public async findByChatId(chatId: number): Promise<AssistantChatMessage[]> {
    return (await this.all())
      .filter((message) => message.chat.id === chatId && message.isActive())
      .sort((first, second) => first.createdAt.getTime() - second.createdAt.getTime());
  }
}
