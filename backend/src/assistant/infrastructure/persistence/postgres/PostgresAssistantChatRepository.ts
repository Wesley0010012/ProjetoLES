import { Repository } from 'typeorm';
import { DomainEntityCodec } from 'src/shared/infrastructure/persistence/postgres/DomainEntityCodec';
import { PersistedDomainEntity } from 'src/shared/infrastructure/persistence/postgres/PersistedDomainEntity';
import { PostgresAbstractEntityRepository } from 'src/shared/infrastructure/persistence/postgres/PostgresAbstractEntityRepository';
import { AssistantChat } from '../../../domain/entities/AssistantChat';
import { AssistantChatRepository } from '../../../domain/repositories/AssistantChatRepository';

export class PostgresAssistantChatRepository
  extends PostgresAbstractEntityRepository<AssistantChat>
  implements AssistantChatRepository
{
  public constructor(
    records: Repository<PersistedDomainEntity>,
    codec: DomainEntityCodec,
  ) {
    super(records, codec, 'assistant.AssistantChat');
  }

  public async findOpenByCustomerId(
    customerId: number,
    now = new Date(),
  ): Promise<AssistantChat | null> {
    return (
      (await this.all()).find(
        (chat) => chat.customer.id === customerId && chat.isOpen(now),
      ) ?? null
    );
  }
}
