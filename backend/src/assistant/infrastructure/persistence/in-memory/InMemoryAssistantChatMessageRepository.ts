import { InMemoryAbstractEntityRepository } from 'src/shared/infrastructure/persistence/in-memory/InMemoryAbstractEntityRepository';
import { AssistantChatMessage } from '../../../domain/entities/AssistantChatMessage';
import { AssistantChatMessageRepository } from '../../../domain/repositories/AssistantChatMessageRepository';

export class InMemoryAssistantChatMessageRepository
  extends InMemoryAbstractEntityRepository<AssistantChatMessage>
  implements AssistantChatMessageRepository
{
  public findByChatId(chatId: number): Promise<AssistantChatMessage[]> {
    return Promise.resolve(
      this._entities
        .filter((message) => message.chat.id === chatId && message.isActive())
        .sort((first, second) => first.createdAt.getTime() - second.createdAt.getTime()),
    );
  }
}
