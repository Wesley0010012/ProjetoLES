import { AssistantAnswerDto } from '../dto/output/AssistantAnswerDto';
import { AssistantChatMessageDto } from '../dto/output/AssistantChatMessageDto';

export type AssistantProductReferenceInput = {
  id: number;
  title: string;
  authors: string[];
  categories: string[];
  synopsis: string;
  price: number;
  available: boolean;
};

export type IAChatServiceInput = {
  question: string;
  history: AssistantChatMessageDto[];
  knowledge: string[];
  products: AssistantProductReferenceInput[];
};

export interface IAChatService {
  generate(
    input: IAChatServiceInput,
  ): Promise<AssistantAnswerDto>;
}
