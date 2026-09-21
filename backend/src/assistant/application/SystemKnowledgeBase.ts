import { asksAboutStore, assistantTerms } from './AssistantSearch';

export class SystemKnowledgeBase {
  public search(question: string): string[] {
    if (!asksAboutStore(question)) return [];
    const terms = assistantTerms(question);
    const ranked = this.documents.map((document) => ({
      document,
      score: terms.filter((word) => assistantTerms(document).includes(word))
        .length,
    }));

    return ranked
      .filter((entry) => entry.score > 0)
      .sort((first, second) => second.score - first.score)
      .slice(0, 5)
      .map((entry) => entry.document);
  }

  private readonly documents: string[] = [
    'A Libra é um e-commerce de livros. O catálogo pode ser pesquisado por título, autor, ISBN, código e categoria.',
    'Para comprar, o cliente cria uma conta, entra como USER e completa o cadastro com dados pessoais, endereço de entrega e cartão.',
    'O carrinho reserva o estoque por 30 minutos. Quantidades podem ser alteradas e itens removidos antes da finalização.',
    'No checkout o cliente escolhe endereço, um ou mais cartões e pode informar cupons. O valor mínimo por cartão é R$ 10, salvo o saldo final de cupom.',
    'O cupom promocional de demonstração LIBRA10 concede desconto de dez por cento. Cupons de troca também podem ser utilizados.',
    'Pedidos ficam disponíveis em Conta, na opção Pedidos. Uma troca total ou parcial pode ser solicitada após o pedido estar entregue.',
    'Após o recebimento de uma troca autorizada, o sistema pode devolver os itens ao estoque e gera um cupom de troca para o cliente.',
    'A conta permite cadastrar e remover endereços e cartões, trocar a senha e sair. Números completos e códigos de segurança de cartões não são armazenados.',
    'A senha precisa ser forte, coincidir com a confirmação e não pode repetir nenhuma das três últimas senhas, considerando a atual.',
    'Operadores administram livros, autores, editoras, categorias, grupos de precificação, clientes, estoque, vendas, trocas, análises e auditoria.',
    'Os preços de venda consideram o maior custo histórico de entrada e a margem do grupo de precificação do livro.',
    'O assistente informa somente dados disponíveis no sistema. Ele não confirma pagamento, estoque futuro, prazo exato ou política que não esteja no contexto.',
  ];
}
