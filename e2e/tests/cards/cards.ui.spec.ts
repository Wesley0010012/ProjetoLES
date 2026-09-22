import type { AuthSession } from '../../support/types';

describe('Cards — interface', () => {
  let user: AuthSession;
  beforeEach(() => cy.newCustomer().then((value) => (user = value)));

  it('cria um cartão, consulta mascarado, altera a descrição e exclui', () => {
    cy.visitAs('/customer/account/cards/new', user);
    cy.fillCard({ number: '4012888888881881' });
    cy.field('description', 'Cartão Cypress');
    cy.contains('button', 'Criar cartão').click();
    cy.location('pathname').should('eq', '/customer/account/cards');
    cy.contains('article', '1881').within(() => cy.contains('a', 'Editar').click());
    cy.get('[name="number"]').should('not.exist');
    cy.field('description', 'Cartão atualizado');
    cy.contains('button', 'Salvar alterações').click();
    cy.contains('article', '1881')
      .should('contain', 'Cartão atualizado')
      .within(() => cy.contains('button', 'Excluir').click());
    cy.contains('article', '1881').should('not.exist');
  });

  (
    [
      ['número inválido', { number: '4242424242424241' }, /number/],
      ['bandeira incompatível', { brand: 'MASTERCARD' }, /brand/],
      ['CVV inválido', { securityCode: '12' }, /securityCode/],
      ['titular incompleto', { printedName: 'Cliente' }, /printedName/],
    ] as const
  ).forEach(([title, data, message]) => {
    it(`recusa cartão com ${title}`, () => {
      cy.visitAs('/customer/account/cards/new', user);
      cy.fillCard(data);
      cy.intercept('POST', `/api/users/${user.userId}/customer/cards`).as('card');
      cy.contains('button', 'Criar cartão').click();
      cy.wait('@card').its('response.statusCode').should('eq', 400);
      cy.contains('p', message).should('be.visible');
      cy.location('pathname').should('eq', '/customer/account/cards/new');
    });
  });

  it('mostra recurso não encontrado ao editar cartão inexistente', () => {
    cy.visitAs('/customer/account/cards/999999/edit', user);
    cy.contains('Cartão não encontrado.').should('be.visible');
  });
});
