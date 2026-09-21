import { AddInputToEntity } from 'src/shared/application/protocols/mappers/AddInputToEntity';
import { FindRequiredEntity } from 'src/shared/application/usecases/FindRequiredEntity';
import { Customer } from 'src/customers/domain/entities/Customer';
import { AddAssistantChatInput } from '../dto/input/AddAssistantChatInput';
import { AssistantChat } from '../../domain/entities/AssistantChat';

const CHAT_TTL_MS = 24 * 60 * 60 * 1000;

export class AssistantChatMapper implements AddInputToEntity<
  AddAssistantChatInput,
  AssistantChat
> {
  public constructor(
    private readonly _customers: FindRequiredEntity<Customer>,
  ) {}

  public async toEntity(input: AddAssistantChatInput): Promise<AssistantChat> {
    const customer = await this._customers.execute(input.customerId);
    return new AssistantChat({
      customer,
      expiresAt: new Date(Date.now() + CHAT_TTL_MS),
    });
  }
}
