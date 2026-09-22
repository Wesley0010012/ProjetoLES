import type { AuthSession } from '../../support/types';

describe('Admin — clientes', () => {
  let operator: AuthSession;
  beforeEach(() => cy.admin().then((value) => (operator = value)));

  (['email', 'CPF', 'nome'] as const).forEach((field, index) => {
    it(`busca cliente por ${field}`, () => {
      cy.newCustomer().then((user) => {
        cy.visitAs('/admin/customers', operator);
        const query = [user.email, user.document, user.profile!.customer.name][index]!;
        cy.get('input[placeholder^="Buscar por nome"]').clear().type(query, { delay: 0 });
        cy.contains('tr', user.email!).should('be.visible');
      });
    });
  });

  it('abre o perfil e os pedidos do cliente encontrado', () => {
    cy.newCustomer().then((user) => {
      cy.placeOrder(user).then((sale) => {
        cy.visitAs('/admin/customers', operator);
        cy.get('input[placeholder^="Buscar por nome"]').clear().type(user.email!);
        cy.contains('tr', user.email!).contains('a', 'Perfil').click();
        cy.contains(user.profile!.customer.name).should('be.visible');
        cy.contains('button', /Transa|Pedido/).click();
        cy.contains(sale.code).should('be.visible');
      });
    });
  });

  it('mostra pesquisa de cliente sem resultados', () => {
    cy.visitAs('/admin/customers', operator);
    cy.get('input[placeholder^="Buscar por nome"]').type('cliente-inexistente-zzzz');
    cy.contains('Nenhum cliente encontrado').should('be.visible');
  });

  it('inativa cliente pela administração e bloqueia o acesso dele', () => {
    cy.newCustomer().then((user) => {
      cy.visitAs('/admin/customers', operator);
      cy.get('input[placeholder^="Buscar por nome"]').type(user.email!);
      cy.contains('tr', user.email!).contains('button', 'Excluir').click();
      cy.contains('Nenhum cliente encontrado').should('be.visible');
      cy.api('GET', `/users/${user.userId}/customer`, undefined, user).its('status').should('eq', 403);
    });
  });

  it('mostra falha de consulta administrativa de clientes', () => {
    cy.intercept('GET', '/api/admin/customers?*', { statusCode: 503, body: { message: 'Consulta temporariamente indisponível' } });
    cy.visitAs('/admin/customers', operator);
    cy.contains('[role="alert"]', 'Consulta temporariamente indisponível').should('be.visible');
  });
});
