import { AddInput } from 'src/shared/application/dto/input/AddInput';
import {
  AssistantChatMessageProduct,
  AssistantChatMessageRole,
} from '../../../domain/entities/AssistantChatMessage';

export class AddAssistantChatMessageInput extends AddInput {
  public constructor(
    public readonly chatId: number,
    public readonly role: AssistantChatMessageRole,
    public readonly content: string,
    public readonly products: AssistantChatMessageProduct[] = [],
    public readonly provider?: string,
  ) {
    super();
  }
}
