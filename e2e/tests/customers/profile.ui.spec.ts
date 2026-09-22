import type { AuthSession } from '../../support/types';

describe('Customers — dados pessoais pela interface', () => {
  let user: AuthSession;
  beforeEach(() => cy.newCustomer().then((value) => (user = value)));

  it('altera o nome e o telefone e mantém os dados após recarregar', () => {
    cy.visitAs('/customer/account/personal', user);
    cy.get('[name="email"]').should('have.value', user.email);
    cy.field('name', 'Cliente Atualizado Cypress');
    cy.field('phone', '988887777');
    cy.contains('button', 'Salvar dados pessoais').click();
    cy.contains('Dados pessoais alterados com sucesso.').should('be.visible');
    cy.reload();
    cy.get('[name="name"]').should('have.value', 'Cliente Atualizado Cypress');
    cy.get('[name="phone"]').should('have.value', '988887777');
  });

  it('mostra falha no carregamento da conta', () => {
    cy.intercept('GET', `/api/users/${user.userId}/customer`, {
      statusCode: 503,
      body: { message: 'Conta temporariamente indisponível' },
    });
    cy.visitAs('/customer/account', user);
    cy.contains('[role="alert"]', 'Conta temporariamente indisponível').should('be.visible');
  });

  (
    [
      ['CPF inválido', 'document', '11111111111'],
      ['data futura', 'birthDate', '2099-01-01'],
      ['DDD inválido', 'ddd', '1'],
    ] as const
  ).forEach(([title, field, value]) => {
    it(`não salva alteração com ${title}`, () => {
      cy.visitAs('/customer/account/personal', user);
      cy.field(field, value);
      cy.intercept('PUT', `/api/users/${user.userId}/customer`).as('update');
      cy.contains('button', 'Salvar dados pessoais').click();
      cy.wait('@update').its('response.statusCode').should('eq', 400);
      cy.get('[role="status"]').should('be.visible');
      cy.api('GET', `/users/${user.userId}/customer`, undefined, user).its('body.customer.document').should('eq', user.document);
    });
  });

  it('permite desistir da inativação da própria conta', () => {
    cy.visitAs('/customer/account', user);
    cy.on('window:confirm', () => false);
    cy.contains('button', 'Inativar minha conta').click();
    cy.api('GET', `/users/${user.userId}/customer`, undefined, user).its('status').should('eq', 200);
  });

  it('confirma a inativação da própria conta e encerra a sessão', () => {
    cy.visitAs('/customer/account', user);
    cy.on('window:confirm', () => true);
    cy.contains('button', 'Inativar minha conta').click();
    cy.location('pathname').should('eq', '/');
    cy.api('GET', `/users/${user.userId}/customer`, undefined, user).its('status').should('eq', 403);
    cy.window().then((win) => expect(win.sessionStorage.getItem('libra.authentication.USER')).eq(null));
  });
});
