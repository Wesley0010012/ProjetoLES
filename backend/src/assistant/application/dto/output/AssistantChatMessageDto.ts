import { OutputDto } from 'src/shared/application/dto/output/OutputDto';
import { AssistantChatMessageRole } from '../../../domain/entities/AssistantChatMessage';
import { AssistantAnswerProductDto } from './AssistantAnswerDto';

export class AssistantChatMessageDto extends OutputDto {
  public constructor(
    public readonly id: number,
    public readonly role: AssistantChatMessageRole,
    public readonly content: string,
    public readonly createdAt: Date,
    public readonly products: AssistantAnswerProductDto[] = [],
    public readonly provider?: string,
  ) {
    super();
  }
}
