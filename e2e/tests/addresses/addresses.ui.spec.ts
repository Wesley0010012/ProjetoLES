import type { AuthSession } from '../../support/types';

describe('Addresses — interface', () => {
  let user: AuthSession;
  beforeEach(() => cy.newCustomer().then((value) => (user = value)));

  it('cria, altera e exclui um endereço adicional', () => {
    cy.visitAs('/customer/account/addresses/new', user);
    cy.fillAddress();
    cy.contains('button', 'Criar endereço').click();
    cy.location('pathname').should('eq', '/customer/account/addresses');
    cy.contains('article', 'Nova entrega Cypress').within(() => cy.contains('a', 'Editar').click());
    cy.field('name', 'Entrega alterada Cypress');
    cy.contains('button', 'Salvar alterações').click();
    cy.contains('article', 'Entrega alterada Cypress').within(() => cy.contains('button', 'Excluir').click());
    cy.contains('Entrega alterada Cypress').should('not.exist');
  });

  it('desabilita a exclusão do endereço principal', () => {
    cy.visitAs('/customer/account/addresses', user);
    cy.contains('article', 'Primary E2E').contains('button', 'Excluir').should('be.disabled');
  });

  it('protege o último endereço de entrega', () => {
    cy.visitAs('/customer/account/addresses', user);
    cy.contains('article', 'Delivery E2E').contains('button', 'Excluir').click();
    cy.get('[role="status"]').should('be.visible');
    cy.contains('article', 'Delivery E2E').should('exist');
  });

  it('rejeita a criação de endereço sem nome preenchido', () => {
    cy.visitAs('/customer/account/addresses/new', user);
    cy.contains('button', 'Criar endereço').click();
    cy.get('[name="name"]').then(($el) => expect(($el[0] as HTMLInputElement).validity.valueMissing).eq(true));
  });

  it('rejeita CEP inválido', () => {
    cy.visitAs('/customer/account/addresses/new', user);
    cy.fillAddress('', { zipCode: '123' });
    cy.intercept('POST', `/api/users/${user.userId}/customer/addresses`).as('address');
    cy.contains('button', 'Criar endereço').click();
    cy.wait('@address').its('response.statusCode').should('eq', 400);
    cy.contains('p', /zipCode|CEP/).should('be.visible');
  });

  it('recupera as opções de endereço após indisponibilidade', () => {
    cy.intercept(
      { method: 'GET', pathname: '/api/metadata/customer-options', times: 1 },
      { statusCode: 503, body: { message: 'Opções indisponíveis' } },
    ).as('options');
    cy.visitAs('/customer/account/addresses/new', user);
    cy.wait('@options');
    cy.get('[role="alert"]').should('be.visible');
    cy.contains('button', 'Criar endereço').should('be.disabled');
    cy.contains('button', 'Tentar novamente').click();
    cy.get('[name="residenceType"]').should('be.enabled');
  });

  it('mostra recurso não encontrado ao editar endereço inexistente', () => {
    cy.visitAs('/customer/account/addresses/999999/edit', user);
    cy.contains('Endereço não encontrado.').should('be.visible');
  });
});
