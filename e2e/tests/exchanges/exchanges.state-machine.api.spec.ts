import { expectRejected } from '../../support/assertions';
import type { Exchange, Sale, AuthSession } from '../../support/types';

type ExchangeAction = 'authorize' | 'reject' | 'arrival' | 'receive';
// Estágios do fluxo de troca tal como o teste os conduz (não são os códigos
// de status reais da API — ver a tabela de mapeamento no README).
type ExchangeStage = 'REQUESTED' | 'AUTHORIZED' | 'DISPATCHED' | 'ARRIVED' | 'RECEIVED' | 'REJECTED';

describe('Exchanges API — solicitações e estados', () => {
  let user: AuthSession, operator: AuthSession, sale: Sale;
  beforeEach(() => {
    cy.newCustomer().then((value) => (user = value));
    cy.admin().then((value) => (operator = value));
    cy.then(() =>
      cy.placeOrder(user, 2).then((value) => {
        sale = value;
        cy.advanceOrder(sale, operator);
      }),
    );
  });

  const payload = () => ({ saleId: sale.id, items: [{ bookId: sale.product.id, quantity: 1 }], reason: 'Livro recebido com defeito de impressão' });

  const invalidCases: Array<[string, (body: any) => void]> = [
    ['pedido inexistente', (b) => (b.saleId = 999999)],
    ['sem itens', (b) => (b.items = [])],
    ['itens em formato inválido', (b) => (b.items = {})],
    ['item nulo na lista', (b) => (b.items = [null])],
    ['livro não pertencente à compra', (b) => (b.items[0].bookId = 999999)],
    ['quantidade zero', (b) => (b.items[0].quantity = 0)],
    ['quantidade negativa', (b) => (b.items[0].quantity = -1)],
    ['quantidade fracionada', (b) => (b.items[0].quantity = 1.5)],
    ['quantidade acima da comprada', (b) => (b.items[0].quantity = 3)],
    ['itens duplicados', (b) => b.items.push({ ...b.items[0] })],
    ['motivo ausente', (b) => delete b.reason],
    ['motivo vazio', (b) => (b.reason = ' ')],
    ['motivo curto', (b) => (b.reason = 'curto')],
    ['motivo muito longo', (b) => (b.reason = 'a'.repeat(501))],
  ];

  invalidCases.forEach(([title, mutate]) => {
    it(`rejeita solicitação de troca com ${title}`, () => {
      const body = payload();
      mutate(body);
      cy.api('POST', '/customer/exchanges', body, user).then((r) => expectRejected(r));
      cy.api('GET', '/customer/orders', undefined, user).then((r) => expect(r.body[0].exchanges).to.be.empty);
    });
  });

  it('rejeita troca solicitada por outro cliente', () => {
    cy.newCustomer().then((other) => cy.api('POST', '/customer/exchanges', payload(), other).then((r) => expectRejected(r)));
  });

  it('rejeita troca antes da entrega do pedido', () => {
    cy.placeOrder(user).then((openSale) => cy.api('POST', '/customer/exchanges', { ...payload(), saleId: openSale.id }, user).then((r) => expectRejected(r)));
  });

  it('não permite solicitar mais unidades do que o saldo disponível em trocas parciais', () => {
    cy.requestExchange(user, sale);
    cy.api('POST', '/customer/exchanges', { ...payload(), items: [{ bookId: sale.product.id, quantity: 2 }] }, user).then((r) => expectRejected(r));
  });

  const prepare = (stage: ExchangeStage): Cypress.Chainable<Exchange> =>
    cy.requestExchange(user, sale).then((exchange) => {
      if (stage === 'REJECTED') cy.api('POST', `/admin/sales/exchanges/${exchange.id}/reject`, { observation: 'Recusada pelo teste' }, operator).its('status').should('eq', 204);
      if ((['AUTHORIZED', 'DISPATCHED', 'ARRIVED', 'RECEIVED'] as ExchangeStage[]).includes(stage))
        cy.api('POST', `/admin/sales/exchanges/${exchange.id}/authorize`, { observation: 'Aprovada pelo teste' }, operator).its('status').should('eq', 204);
      if ((['DISPATCHED', 'ARRIVED', 'RECEIVED'] as ExchangeStage[]).includes(stage))
        cy.api('POST', `/customer/exchanges/${sale.id}/dispatch`, {}, user).its('status').should('eq', 204);
      if ((['ARRIVED', 'RECEIVED'] as ExchangeStage[]).includes(stage))
        cy.api('POST', `/admin/sales/exchanges/${exchange.id}/arrival`, {}, operator).its('status').should('eq', 204);
      if (stage === 'RECEIVED')
        cy.api('POST', `/admin/sales/exchanges/${exchange.id}/receive`, { returnToStock: true, receivedAt: new Date().toISOString() }, operator)
          .its('status')
          .should('eq', 201);
      return cy.wrap(exchange);
    });

  const permittedActionsByStage: Record<ExchangeStage, ExchangeAction[]> = {
    REQUESTED: ['authorize', 'reject'],
    AUTHORIZED: [],
    DISPATCHED: ['arrival'],
    ARRIVED: ['receive'],
    RECEIVED: [],
    REJECTED: [],
  };

  (Object.keys(permittedActionsByStage) as ExchangeStage[]).forEach((stage) => {
    const permitted = permittedActionsByStage[stage];
    (['authorize', 'reject', 'arrival', 'receive'] as ExchangeAction[]).filter((action) => !permitted.includes(action)).forEach((action) => {
      it(`rejeita a ação "${action}" em troca no estágio ${stage}`, () => {
        prepare(stage).then((exchange) => {
          cy.api(
            'POST',
            `/admin/sales/exchanges/${exchange.id}/${action}`,
            { observation: 'Análise de teste', returnToStock: true, receivedAt: new Date().toISOString() },
            operator,
          ).then((r) => expectRejected(r));
        });
      });
    });

    if (stage !== 'AUTHORIZED') {
      it(`cliente não pode despachar troca no estágio ${stage}`, () => {
        prepare(stage);
        cy.api('POST', `/customer/exchanges/${sale.id}/dispatch`, {}, user).then((r) => expectRejected(r));
      });
    }
  });

  (['authorize', 'reject'] as const).forEach((action) => {
    (['', 'x', 'a'.repeat(501)] as const).forEach((observation, index) => {
      it(`rejeita justificativa inválida (caso ${index + 1}) ao ${action === 'authorize' ? 'aceitar' : 'recusar'} a troca`, () => {
        prepare('REQUESTED').then((exchange) => {
          cy.api('POST', `/admin/sales/exchanges/${exchange.id}/${action}`, { observation }, operator).then((r) => expectRejected(r));
        });
      });
    });
  });

  it('rejeita recebimento sem os campos obrigatórios', () => {
    prepare('ARRIVED').then((exchange) => {
      cy.api('POST', `/admin/sales/exchanges/${exchange.id}/receive`, {}, operator).then((r) => expectRejected(r));
    });
  });

  it('rejeita recebimento com returnToStock em formato inválido', () => {
    prepare('ARRIVED').then((exchange) => {
      cy.api('POST', `/admin/sales/exchanges/${exchange.id}/receive`, { returnToStock: 'sim', receivedAt: new Date().toISOString() }, operator).then(
        (r) => expectRejected(r),
      );
    });
  });

  it('rejeita recebimento com data inválida', () => {
    prepare('ARRIVED').then((exchange) => {
      cy.api('POST', `/admin/sales/exchanges/${exchange.id}/receive`, { returnToStock: true, receivedAt: 'invalid' }, operator).then((r) =>
        expectRejected(r),
      );
    });
  });

  it('impede gerar cupom duplicado ao receber a mesma troca duas vezes', () => {
    prepare('ARRIVED').then((exchange) => {
      const body = { returnToStock: true, receivedAt: new Date().toISOString() };
      cy.api('POST', `/admin/sales/exchanges/${exchange.id}/receive`, body, operator).its('status').should('eq', 201);
      cy.api('POST', `/admin/sales/exchanges/${exchange.id}/receive`, body, operator).then((r) => expectRejected(r));
      cy.api('GET', '/customer/coupons', undefined, user).then((r) => expect(r.body.filter((c: any) => c.type === 'EXCHANGE')).to.have.length(1));
    });
  });
});
