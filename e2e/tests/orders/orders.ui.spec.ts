import type { Sale, AuthSession } from '../../support/types';

describe('Orders — interface', () => {
  let user: AuthSession, operator: AuthSession, sale: Sale;
  beforeEach(() => {
    cy.newCustomer().then((value) => (user = value));
    cy.admin().then((value) => (operator = value));
    cy.then(() => cy.placeOrder(user, 2).then((value) => (sale = value)));
  });
  const order = () => cy.contains('article', sale.code);
  const visitAdmin = () => cy.visitAs('/admin/sales/orders', operator);
  const advanceUI = (label: string) => {
    order().contains('button', `Alterar para ${label}`).click();
    order().should('contain', label);
  };

  it('consulta o resumo do pedido pela administração', () => {
    visitAdmin();
    order().contains('button', 'Ver resumo').click();
    cy.get('[role="dialog"]').should('contain', sale.code).and('contain', user.profile!.customer.name).and('contain', sale.product.title);
    cy.get('[role="dialog"]').contains('button', 'Fechar').click();
  });

  it('executa todas as transições administrativas até a entrega', () => {
    visitAdmin();
    (['EM PROCESSAMENTO', 'PAGAMENTO REALIZADO', 'EM TRANSITO', 'ENTREGUE'] as const).forEach(advanceUI);
    order().contains('button', 'Alterar para').should('not.exist');
    cy.visitAs('/customer/orders', user);
    order().should('contain', 'Entregue');
    order().contains('button', 'Ver resumo').click();
    cy.get('[role="dialog"]').should('contain', 'Delivery E2E').and('contain', '4242');
  });

  it('cliente confirma recebimento de pedido em trânsito', () => {
    cy.advanceOrder(sale, operator, ['process', 'payment', 'dispatch']);
    cy.visitAs('/customer/orders', user);
    order().contains('button', 'Confirmar recebimento').click();
    cy.contains('Recebimento confirmado.').should('be.visible');
    order().should('contain', 'Entregue');
    order().contains('button', 'Confirmar recebimento').should('not.exist');
  });

  ([[], ['process'], ['process', 'payment']] as const).forEach((steps) => {
    it(`cancela pedido no estágio ${steps.at(-1) || 'aberto'}`, () => {
      cy.advanceOrder(sale, operator, [...steps]);
      cy.visitAs('/customer/orders', user);
      order().contains('button', 'Cancelar pedido').click();
      cy.contains('Pedido cancelado com sucesso.').should('be.visible');
      order().should('contain', 'Cancelada');
      order().contains('button', 'Cancelar pedido').should('not.exist');
    });
  });

  it('não oferece recebimento antes do envio', () => {
    cy.visitAs('/customer/orders', user);
    order().contains('button', 'Confirmar recebimento').should('not.exist');
    order().contains('button', 'Solicitar troca').should('not.exist');
  });

  it('não oferece cancelamento a partir de "em trânsito"', () => {
    cy.advanceOrder(sale, operator, ['process', 'payment', 'dispatch']);
    cy.visitAs('/customer/orders', user);
    order().contains('button', 'Cancelar pedido').should('not.exist');
  });

  it('exibe erro de cancelamento e permite tentar novamente', () => {
    cy.intercept(
      { method: 'POST', url: `/api/customer/orders/${sale.id}/cancel`, times: 1 },
      { statusCode: 409, body: { message: 'Pedido alterado por outro operador' } },
    );
    cy.visitAs('/customer/orders', user);
    order().contains('button', 'Cancelar pedido').click();
    cy.contains('Pedido alterado por outro operador').should('be.visible');
    order().should('contain', 'Em aberto');
    order().contains('button', 'Cancelar pedido').click();
    order().should('contain', 'Cancelada');
  });

  it('exibe falha ao avançar pedido e preserva o estado anterior', () => {
    cy.intercept('POST', `/api/admin/sales/${sale.id}/process`, { statusCode: 400, body: { message: 'Transição inválida' } });
    visitAdmin();
    advanceUI('EM PROCESSAMENTO');
    cy.contains('[role="alert"]', 'Transição inválida').should('be.visible');
    order().should('contain', 'EM ABERTO');
  });

  it('exibe erro de consulta dos pedidos sem rejeição não tratada', () => {
    cy.intercept('GET', '/api/customer/orders', { statusCode: 503, body: { message: 'Pedidos indisponíveis' } });
    cy.visitAs('/customer/orders', user);
    cy.contains('Pedidos indisponíveis').should('be.visible');
  });
});
