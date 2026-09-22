import { expectRejected } from '../../support/assertions';
import type { AuthSession } from '../../support/types';

describe('Admin — pedidos', () => {
  let operator: AuthSession;
  beforeEach(() => cy.admin().then((value) => (operator = value)));

  it('avança para a próxima página de pedidos', () => {
    cy.visitAs('/admin/sales/orders', operator);
    cy.contains('Página 1 de').should('be.visible');
    cy.contains('button', 'Anterior').should('be.disabled');
    cy.contains('button', 'Próxima').click();
    cy.contains('Página 2 de').should('be.visible');
  });

  it('volta para a página anterior de pedidos', () => {
    cy.visitAs('/admin/sales/orders', operator);
    cy.contains('button', 'Próxima').click();
    cy.contains('button', 'Anterior').click();
    cy.contains('Página 1 de').should('be.visible');
  });

  it('mostra falha de consulta administrativa de pedidos', () => {
    cy.intercept('GET', '/api/admin/sales?*', { statusCode: 503, body: { message: 'Consulta temporariamente indisponível' } });
    cy.visitAs('/admin/sales/orders', operator);
    cy.contains('[role="alert"]', 'Consulta temporariamente indisponível').should('be.visible');
  });
});

describe('Admin API — paginação', () => {
  let operator: AuthSession;
  beforeEach(() => cy.admin().then((value) => (operator = value)));

  (['page=0', 'page=-1', 'page=1.5', 'page=abc', 'pageSize=0', 'pageSize=101'] as const).forEach((query) => {
    (['/admin/sales', '/admin/sales/exchanges'] as const).forEach((path) => {
      it(`rejeita ${path} com paginação inválida (${query})`, () => {
        cy.api('GET', `${path}?${query}`, undefined, operator).then((r) => expectRejected(r));
      });
    });
  });
});
