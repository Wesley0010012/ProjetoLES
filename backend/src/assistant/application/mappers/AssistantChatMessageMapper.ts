import { AddInputToEntity } from 'src/shared/application/protocols/mappers/AddInputToEntity';
import { EntityToOutputDto } from 'src/shared/application/protocols/mappers/EntityToOutputDto';
import { FindRequiredEntity } from 'src/shared/application/usecases/FindRequiredEntity';
import { AddAssistantChatMessageInput } from '../dto/input/AddAssistantChatMessageInput';
import { AssistantChatMessageDto } from '../dto/output/AssistantChatMessageDto';
import { AssistantChat } from '../../domain/entities/AssistantChat';
import { AssistantChatMessage } from '../../domain/entities/AssistantChatMessage';

export class AssistantChatMessageMapper
  implements
    AddInputToEntity<AddAssistantChatMessageInput, AssistantChatMessage>,
    EntityToOutputDto<AssistantChatMessage, AssistantChatMessageDto>
{
  public constructor(
    private readonly _chats: FindRequiredEntity<AssistantChat>,
  ) {}

  public async toEntity(
    input: AddAssistantChatMessageInput,
  ): Promise<AssistantChatMessage> {
    const chat = await this._chats.execute(input.chatId);
    return new AssistantChatMessage({
      chat,
      role: input.role,
      content: input.content,
      products: input.products,
      provider: input.provider,
    });
  }

  public toDto(
    message: AssistantChatMessage,
  ): Promise<AssistantChatMessageDto> {
    return Promise.resolve(
      new AssistantChatMessageDto(
        message.id,
        message.role,
        message.content,
        message.createdAt,
        message.products,
        message.provider,
      ),
    );
  }
}
