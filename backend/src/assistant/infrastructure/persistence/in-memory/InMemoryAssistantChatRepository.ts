import { InMemoryAbstractEntityRepository } from 'src/shared/infrastructure/persistence/in-memory/InMemoryAbstractEntityRepository';
import { AssistantChat } from '../../../domain/entities/AssistantChat';
import { AssistantChatRepository } from '../../../domain/repositories/AssistantChatRepository';

export class InMemoryAssistantChatRepository
  extends InMemoryAbstractEntityRepository<AssistantChat>
  implements AssistantChatRepository
{
  public findOpenByCustomerId(
    customerId: number,
    now = new Date(),
  ): Promise<AssistantChat | null> {
    return Promise.resolve(
      this._entities.find(
        (chat) => chat.customer.id === customerId && chat.isOpen(now),
      ) ?? null,
    );
  }
}
