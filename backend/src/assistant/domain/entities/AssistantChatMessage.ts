import {
  AbstractEntity,
  AbstractEntityProps,
} from 'src/shared/domain/entities/AbstractEntity';
import { AssistantChat } from './AssistantChat';

export type AssistantChatMessageRole = 'user' | 'assistant';

export type AssistantChatMessageProduct = {
  id: number;
  title: string;
  price: number;
  available: boolean;
};

export type AssistantChatMessageProps = AbstractEntityProps & {
  chat: AssistantChat;
  role: AssistantChatMessageRole;
  content: string;
  products?: AssistantChatMessageProduct[];
  provider?: string;
};

export class AssistantChatMessage extends AbstractEntity<AssistantChatMessageProps> {
  public get chat(): AssistantChat {
    return this._props.chat;
  }

  public get role(): AssistantChatMessageRole {
    return this._props.role;
  }

  public get content(): string {
    return this._props.content;
  }

  public get products(): AssistantChatMessageProduct[] {
    return [...(this._props.products ?? [])];
  }

  public get provider(): string | undefined {
    return this._props.provider;
  }
}
