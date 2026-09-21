import { AddInput } from 'src/shared/application/dto/input/AddInput';

export class AddAssistantChatInput extends AddInput {
  public constructor(public readonly customerId: number) {
    super();
  }
}
