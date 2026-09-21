import { SystemKnowledgeBase } from './SystemKnowledgeBase';
import { AskAssistant } from './usecases/AskAssistant';

describe('Assistant relevance', () => {
  const question =
    'Se uma pessoa entrar em uma sala completamente vazia, colocar uma cadeira no meio dela, sentar por cinco minutos, levantar, sair da sala, fechar a porta e nunca mais voltar, a cadeira passa a ser uma cadeira usada, uma cadeira abandonada, uma cadeira com experiência, ou ela simplesmente continua sendo uma cadeira que teve o azar de participar de uma situação totalmente desnecessária?';
  const knowledge = new SystemKnowledgeBase();
  const assistant = Object.assign(Object.create(AskAssistant.prototype), {
    _books: {
      list: async () => [
        {
          id: 1,
          title: 'Domain-Driven Design',
          isbn: '9780321125217',
          authors: [{ name: 'Eric Evans' }],
          categories: [{ name: 'Programação' }],
          synopsis: 'Uma experiência para criar sistemas.',
          price: 49.4,
          available: true,
        },
      ],
    },
  });

  it('does not attach store rules or products to the unrelated chair question', async () => {
    const products = await assistant.findRelatedProducts(question);
    expect(products).toEqual([]);
    expect(knowledge.search(question)).toEqual([]);
  });

  it('retains relevant store help and explicit book searches', async () => {
    expect(
      knowledge.search('Como acompanhar meus pedidos?').join(' '),
    ).toContain('Pedidos');
    expect(
      await assistant.findRelatedProducts('Recomende livros de programação'),
    ).toHaveLength(1);
    expect(
      await assistant.findRelatedProducts('Tem Domain-Driven Design?'),
    ).toHaveLength(1);
    expect(
      await assistant.findRelatedProducts('Como alterar minha senha?'),
    ).toEqual([]);
  });
});
