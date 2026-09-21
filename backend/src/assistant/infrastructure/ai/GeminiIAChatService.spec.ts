import { GeminiIAChatService } from './GeminiIAChatService';
import { AssistantUnavailable } from '../../domain/errors/AssistantUnavailable';
import { IAChatServiceInput } from '../../application/protocols/IAChatService';
import { Logger } from '@nestjs/common';

describe('Gemini integration', () => {
  const input: IAChatServiceInput = {
    question: 'Olá',
    history: [],
    knowledge: [],
    products: [],
  };
  afterEach(() => jest.restoreAllMocks());

  it('uses the supplied key and model with a request timeout', async () => {
    const fetchMock = jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(
        Response.json({ choices: [{ message: { content: 'Resposta' } }] }),
      );
    const result = await new GeminiIAChatService(
      'test-key',
      'test-model',
    ).generate(input);
    expect(result.answer).toBe('Resposta');
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(
      'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
    );
    expect(init?.headers).toMatchObject({ Authorization: 'Bearer test-key' });
    expect(JSON.parse(init?.body as string).model).toBe('test-model');
    expect(init?.signal).toBeInstanceOf(AbortSignal);
  });

  it.each([401, 403, 429, 500])(
    'reports HTTP %s without a local answer or logging secrets',
    async (status) => {
      jest
        .spyOn(global, 'fetch')
        .mockResolvedValue(new Response('sensitive provider body', { status }));
      const warn = jest
        .spyOn(Logger.prototype, 'warn')
        .mockImplementation(() => undefined);
      const service = new GeminiIAChatService('test-key', 'test-model');
      await expect(service.generate(input)).rejects.toBeInstanceOf(
        AssistantUnavailable,
      );
      expect(warn).toHaveBeenCalledWith(`GEMINI_PROVIDER_${status}`);
    },
  );

  it('rejects empty provider responses', async () => {
    jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(Response.json({ choices: [] }));
    await expect(
      new GeminiIAChatService('test-key', 'test-model').generate(input),
    ).rejects.toBeInstanceOf(AssistantUnavailable);
  });
  it('does not call the provider without a configured key', async () => {
    const fetchMock = jest.spyOn(global, 'fetch');
    await expect(
      new GeminiIAChatService('', 'test-model').generate(input),
    ).rejects.toBeInstanceOf(AssistantUnavailable);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it.each(['TimeoutError', 'TypeError'])(
    'does not return a local answer on %s',
    async (name) => {
      jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
      jest
        .spyOn(global, 'fetch')
        .mockRejectedValue(
          Object.assign(new Error('private detail'), { name }),
        );
      await expect(
        new GeminiIAChatService('key', 'model').generate(input),
      ).rejects.toBeInstanceOf(AssistantUnavailable);
    },
  );
});
