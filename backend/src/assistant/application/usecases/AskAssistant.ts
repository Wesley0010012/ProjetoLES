import type { BookUseCases } from 'src/books/presentation/controllers/BookUseCases';
import { CustomerDto } from 'src/customers/application/dto/CustomerDto';
import { Customer } from 'src/customers/domain/entities/Customer';
import { CustomerRepository } from 'src/customers/domain/repositories/CustomerRepository';
import { AddEntity } from 'src/shared/application/usecases/AddEntity';
import { FindEntityById } from 'src/shared/application/usecases/FindEntityById';
import { EntityToOutputDto } from 'src/shared/application/protocols/mappers/EntityToOutputDto';
import { MessageKeyEnum } from 'src/shared/domain/enums/MessageKeyEnum';
import { NotFound } from 'src/shared/domain/errors/NotFound';
import { CreatedEntityDto } from 'src/shared/application/dto/output/CreatedEntityDto';
import { AddAssistantChatInput } from '../dto/input/AddAssistantChatInput';
import { AddAssistantChatMessageInput } from '../dto/input/AddAssistantChatMessageInput';
import { AskAssistantInputDto } from '../dto/input/AskAssistantInputDto';
import { AssistantAnswerDto } from '../dto/output/AssistantAnswerDto';
import { AssistantChatMessageDto } from '../dto/output/AssistantChatMessageDto';
import { AssistantChat } from '../../domain/entities/AssistantChat';
import { AssistantChatMessage } from '../../domain/entities/AssistantChatMessage';
import { AssistantChatRepository } from '../../domain/repositories/AssistantChatRepository';
import { AssistantChatMessageRepository } from '../../domain/repositories/AssistantChatMessageRepository';
import { IAChatService } from '../protocols/IAChatService';
import { SystemKnowledgeBase } from '../SystemKnowledgeBase';
import { asksAboutBooks, assistantTerms } from '../AssistantSearch';

export class AskAssistant {
  public constructor(
    private readonly _books: BookUseCases,
    private readonly _customers: CustomerRepository,
    private readonly _findCustomerById: FindEntityById<Customer, CustomerDto>,
    private readonly _chats: AssistantChatRepository,
    private readonly _messages: AssistantChatMessageRepository,
    private readonly _addChat: AddEntity<
      AssistantChat,
      AddAssistantChatInput,
      CreatedEntityDto
    >,
    private readonly _addMessage: AddEntity<
      AssistantChatMessage,
      AddAssistantChatMessageInput,
      CreatedEntityDto
    >,
    private readonly _messageMapper: EntityToOutputDto<
      AssistantChatMessage,
      AssistantChatMessageDto
    >,
    private readonly _knowledgeBase: SystemKnowledgeBase,
    private readonly _iaChatService: IAChatService,
  ) {}

  public async execute(
    input: AskAssistantInputDto,
  ): Promise<AssistantAnswerDto> {
    const customer = await this._customers.findByUserId(input.userId);
    if (!customer?.isActive()) {
      throw new NotFound(MessageKeyEnum.ENTITY_NOT_FOUND, { id: input.userId });
    }

    const customerDto = await this._findCustomerById.execute(customer.id);
    const chat = await this.findOrCreateChat(customerDto.id);

    await this._addMessage.executeEntity(
      new AddAssistantChatMessageInput(chat.id, 'user', input.question),
    );

    const history = await this.getChatHistory(chat.id);
    const products = await this.findRelatedProducts(input.question);
    const answer = await this._iaChatService.generate({
      question: input.question,
      history,
      knowledge: this._knowledgeBase.search(input.question),
      products,
    });

    await this._addMessage.executeEntity(
      new AddAssistantChatMessageInput(
        chat.id,
        'assistant',
        answer.answer,
        answer.products,
        answer.provider,
      ),
    );

    return answer;
  }

  private async findOrCreateChat(customerId: number): Promise<AssistantChat> {
    const openChat = await this._chats.findOpenByCustomerId(customerId);
    if (openChat) {
      return openChat;
    }

    return this._addChat.executeEntity(new AddAssistantChatInput(customerId));
  }

  private async getChatHistory(
    chatId: number,
  ): Promise<AssistantChatMessageDto[]> {
    const messages = await this._messages.findByChatId(chatId);
    return Promise.all(
      messages.slice(-8).map((message) => this._messageMapper.toDto(message)),
    );
  }

  private async findRelatedProducts(question: string) {
    const products = await this._books.list();
    const normalizedQuestion = this.normalize(question);
    const requestsRecommendation = asksAboutBooks(question);
    const namedProducts = products.filter((product) =>
      [
        product.title,
        product.isbn,
        ...product.authors.map((author) => author.name),
      ].some((name) => {
        const normalized = this.normalize(name);
        return (
          normalized.length >= 5 &&
          ` ${normalizedQuestion.replace(/[^a-z0-9]+/g, ' ')} `.includes(
            ` ${normalized.replace(/[^a-z0-9]+/g, ' ')} `,
          )
        );
      }),
    );
    if (!requestsRecommendation && namedProducts.length === 0) return [];
    const terms = assistantTerms(question);
    const rankedProducts = products
      .map((product) => ({
        product,
        score: terms.filter((term) =>
          assistantTerms(
            [
              product.title,
              product.synopsis,
              ...product.authors.map((author) => author.name),
              ...product.categories.map((category) => category.name),
            ].join(' '),
          ).includes(term),
        ).length,
      }))
      .filter((entry) => entry.score > 0)
      .sort((first, second) => second.score - first.score)
      .slice(0, 8);
    const relatedProducts = !requestsRecommendation
      ? namedProducts.slice(0, 8)
      : rankedProducts.length > 0
        ? rankedProducts.map((entry) => entry.product)
        : requestsRecommendation
          ? products.slice(0, 8)
          : [];

    return relatedProducts.map((product) => ({
      id: product.id,
      title: product.title,
      authors: product.authors.map((author) => author.name),
      categories: product.categories.map((category) => category.name),
      synopsis: product.synopsis,
      price: product.price,
      available: product.available,
    }));
  }

  private normalize(value: string): string {
    return value
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLocaleLowerCase('pt-BR');
  }
}
