import { CrudRepository } from 'src/shared/domain/repositories/CrudRepository';
import { AssistantChat } from '../entities/AssistantChat';

export interface AssistantChatRepository extends CrudRepository<AssistantChat> {
  findOpenByCustomerId(customerId: number, now?: Date): Promise<AssistantChat | null>;
}
