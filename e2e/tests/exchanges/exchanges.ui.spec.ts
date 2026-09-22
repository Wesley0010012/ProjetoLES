import type { Sale, AuthSession } from '../../support/types';

describe('Exchanges — interface', () => {
  let user: AuthSession, operator: AuthSession, sale: Sale;
  beforeEach(() => {
    cy.newCustomer().then((value) => (user = value));
    cy.admin().then((value) => (operator = value));
    cy.then(() => cy.placeOrder(user, 2).then((value) => (sale = value)));
  });
  const order = () => cy.contains('article', sale.code);

  it('solicita troca parcial, aceita, despacha, recebe, processa e consulta o cupom', () => {
    cy.advanceOrder(sale, operator);
    cy.visitAs('/customer/orders', user);
    order().contains('button', 'Solicitar troca').click();
    cy.get('[data-testid="exchange-dialog"]').within(() => {
      cy.get('input[type="number"]').clear().type('1');
      cy.get('textarea').type('Uma unidade chegou com páginas danificadas.');
      cy.intercept('POST', '/api/customer/exchanges').as('exchange');
      cy.contains('button', 'Solicitar troca').click();
    });
    cy.wait('@exchange').then(({ response }) => {
      expect(response!.statusCode).eq(201);
      const exchange = response!.body;
      cy.visitAs('/admin/sales/exchanges', operator);
      cy.contains('article', exchange.code).contains('button', 'Aceitar troca').click();
      cy.get('[role="dialog"]').within(() => {
        cy.get('textarea').type('Aprovada após análise do defeito.');
        cy.contains('button', 'Confirmar decisão').click();
      });
      cy.get('[role="dialog"]').should('not.exist');
      cy.contains('article', exchange.code).should('contain', 'TROCA AUTORIZADA');
      cy.visitAs('/customer/orders', user);
      order().contains('button', 'Informar despacho').click();
      cy.contains('Despacho do item informado.').should('be.visible');
      cy.visitAs('/admin/sales/exchanges', operator);
      cy.contains('article', exchange.code).contains('button', 'Marcar item recebido').click();
      cy.contains('article', exchange.code).should('contain', 'ITEM RECEBIDO');
      cy.intercept('POST', `/api/admin/sales/exchanges/${exchange.id}/receive`).as('coupon');
      cy.contains('article', exchange.code).contains('button', 'Finalizar e gerar cupom').click();
      cy.wait('@coupon').then(({ response: couponResponse }) => {
        expect(couponResponse!.statusCode).eq(201);
        cy.contains('article', exchange.code).should('contain', couponResponse!.body.code);
        cy.visitAs('/customer/coupons', user);
        cy.contains('article', couponResponse!.body.code).should('contain', 'Troca').and('contain', 'Disponível');
      });
    });
  });

  it('recusa troca exigindo justificativa e mantém o pedido entregue', () => {
    cy.advanceOrder(sale, operator);
    cy.requestExchange(user, sale).then((exchange) => {
      cy.visitAs('/admin/sales/exchanges', operator);
      cy.contains('article', exchange.code).contains('button', 'Negar troca').click();
      cy.get('[role="dialog"]').contains('button', 'Confirmar decisão').click();
      cy.contains('Informe uma observação com pelo menos 5 caracteres.').should('exist');
      cy.get('[role="dialog"]').within(() => {
        cy.get('textarea').type('Solicitação fora das condições de troca.');
        cy.contains('button', 'Confirmar decisão').click();
      });
      cy.get('[role="dialog"]').should('not.exist');
      cy.contains('article', exchange.code).should('contain', 'TROCA RECUSADA');
      cy.visitAs('/customer/orders', user);
      order().should('contain', 'Entregue');
      order().contains('button', 'Informar despacho').should('not.exist');
    });
  });

  it('valida a quantidade e o motivo da troca sem enviar solicitação inválida', () => {
    cy.advanceOrder(sale, operator);
    cy.visitAs('/customer/orders', user);
    order().contains('button', 'Solicitar troca').click();
    cy.get('[data-testid="exchange-dialog"]').contains('button', 'Solicitar troca').click();
    cy.contains('Informe a quantidade de ao menos um item').should('exist');
    cy.get('[data-testid="exchange-dialog"] input').clear().type('999');
    cy.get('[data-testid="exchange-dialog"] input').should('have.value', '2');
    cy.get('[data-testid="exchange-dialog"]').contains('button', 'Solicitar troca').click();
    cy.contains('p', 'Descreva o motivo da troca com pelo menos 10 caracteres.').should('exist');
    cy.get('[data-testid="exchange-dialog"]').contains('button', 'Voltar').click();
    cy.get('[data-testid="exchange-dialog"]').should('not.exist');
  });
});
