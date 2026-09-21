import { CrudRepository } from 'src/shared/domain/repositories/CrudRepository';
import { AssistantChatMessage } from '../entities/AssistantChatMessage';

export interface AssistantChatMessageRepository
  extends CrudRepository<AssistantChatMessage> {
  findByChatId(chatId: number): Promise<AssistantChatMessage[]>;
}
