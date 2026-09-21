import { Logger } from '@nestjs/common';

import { AssistantUnavailable } from '../../domain/errors/AssistantUnavailable';

import { AssistantAnswerDto } from '../../application/dto/output/AssistantAnswerDto';

import {
  IAChatService,
  IAChatServiceInput,
} from '../../application/protocols/IAChatService';

export type GeminiGenerateContentResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
};

export class GeminiIAChatService implements IAChatService {
  private readonly logger = new Logger(GeminiIAChatService.name);

  public constructor(
    private readonly _apiKey: string,
    private readonly _model = 'gemini-flash-latest',
    private readonly _baseUrl =
      'https://generativelanguage.googleapis.com/v1beta',
  ) {
  }

  public async generate(
    input: IAChatServiceInput,
  ): Promise<AssistantAnswerDto> {
    if (!this._apiKey.trim()) {
      throw new AssistantUnavailable();
    }

    try {
      return await this.requestAnswer(input);
    } catch (error) {
      const reason =
        error instanceof Error &&
          /^GEMINI_PROVIDER_(\d{3}|EMPTY_RESPONSE)$/.test(error.message)
          ? error.message
          : error instanceof Error && error.name === 'TimeoutError'
            ? 'GEMINI_TIMEOUT'
            : 'GEMINI_CONNECTION_ERROR';

      this.logger.warn(reason);

      throw new AssistantUnavailable();
    }
  }

  private async requestAnswer(
    input: IAChatServiceInput,
  ): Promise<AssistantAnswerDto> {
    const productsContext = input.products
      .map((product) => JSON.stringify(product))
      .join('\n');

    const systemInstruction = [
      'Você é Libra, assistente do e-commerce de livros.',
      'Responda em português do Brasil, de forma objetiva.',
      'Use apenas o contexto fornecido; admita quando não souber.',
      'Nunca invente preço, disponibilidade, política ou pedido.',
      `REGRAS:\n${input.knowledge.join('\n')}`,
      `PRODUTOS:\n${productsContext}`,
    ].join('\n\n');

    const response = await fetch(
      `${this._baseUrl.replace(/\/+$/, '')}/models/${this._model}:generateContent`,
      {
        method: 'POST',

        signal: AbortSignal.timeout(300000),

        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': this._apiKey,
        },

        body: JSON.stringify({
          system_instruction: {
            parts: [
              {
                text: systemInstruction,
              },
            ],
          },

          contents: input.history.map((message) => ({
            role: message.role === 'assistant' ? 'model' : 'user',

            parts: [
              {
                text: message.content,
              },
            ],
          })),

          generationConfig: {
            temperature: 0.2,
          },
        }),
      },
    );

    console.log(response);

    if (!response.ok) {
      const body = await response.text();

      this.logger.error(
        `Gemini ${response.status}: ${body}`,
      );

      throw new Error(`GEMINI_PROVIDER_${response.status}`);
    }

    const payload =
      (await response.json()) as GeminiGenerateContentResponse;

    const answer = payload.candidates?.[0]?.content?.parts
      ?.map((part) => part.text ?? '')
      .join('')
      .trim();

    if (!answer) {
      throw new Error('GEMINI_PROVIDER_EMPTY_RESPONSE');
    }

    return new AssistantAnswerDto(
      answer,

      input.products.slice(0, 4).map((product) => ({
        id: product.id,
        title: product.title,
        price: product.price,
        available: product.available,
      })),

      this._model,
    );
  }
}