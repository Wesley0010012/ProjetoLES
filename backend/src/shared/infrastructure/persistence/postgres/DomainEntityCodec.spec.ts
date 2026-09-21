import { DomainEntityCodec } from './DomainEntityCodec';
import { AssistantChat } from 'src/assistant/domain/entities/AssistantChat';
import { AssistantChatMessage } from 'src/assistant/domain/entities/AssistantChatMessage';

describe('Assistant persistence', () => {
  const codec = new DomainEntityCodec();
  const chat = {
    $type: 'AssistantChat',
    _id: 10,
    _props: {
      $type: 'Object',
      active: true,
      customer: { $type: 'Customer', _id: 1 },
      expiresAt: { $type: 'Date', value: '2099-01-01T00:00:00.000Z' },
    },
  };

  it('restores methods and customer access on existing chats', () => {
    const restored = codec.decode<AssistantChat>(chat);
    expect(restored).toBeInstanceOf(AssistantChat);
    expect(restored.customer.id).toBe(1);
    expect(restored.isOpen(new Date('2026-01-01'))).toBe(true);
    expect(restored.isOpen(new Date('2100-01-01'))).toBe(false);
  });

  it('restores persisted message history and nested chat entities', () => {
    const restored = codec.decode<AssistantChatMessage>({
      $type: 'AssistantChatMessage',
      _id: 20,
      _props: {
        $type: 'Object',
        chat,
        active: true,
        role: 'user',
        content: 'Como acompanhar meu pedido?',
        createdAt: { $type: 'Date', value: '2026-09-20T10:00:00.000Z' },
      },
    });
    expect(restored).toBeInstanceOf(AssistantChatMessage);
    expect(restored.chat).toBeInstanceOf(AssistantChat);
    expect(restored.chat.id).toBe(10);
    expect(restored.isActive()).toBe(true);
    expect(restored.role).toBe('user');
    expect(restored.content).toBe('Como acompanhar meu pedido?');
    expect(restored.createdAt).toBeInstanceOf(Date);
    expect(
      codec.decode<AssistantChatMessage>(codec.encode(restored)).content,
    ).toBe(restored.content);
  });
});
