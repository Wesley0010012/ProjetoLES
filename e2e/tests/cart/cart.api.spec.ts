import { expectRejected } from '../../support/assertions';
import type { AuthSession } from '../../support/types';

describe('Cart API — validações', () => {
  let user: AuthSession;
  beforeEach(() => cy.newCustomer().then((value) => (user = value)));

  ([0, -1, 1.5, 'abc', null] as const).forEach((quantity) => {
    it(`rejeita item com quantidade ${JSON.stringify(quantity)}`, () => {
      cy.api('POST', '/customer/cart/items', { bookId: 4, quantity }, user).then((r) => expectRejected(r));
      cy.api('GET', '/customer/cart', undefined, user).its('body.items').should('be.empty');
    });
  });

  ([0, -1, 1.5, 'abc'] as const).forEach((bookId) => {
    it(`rejeita item com bookId ${JSON.stringify(bookId)}`, () => {
      cy.api('POST', '/customer/cart/items', { bookId, quantity: 1 }, user).then((r) => expectRejected(r));
    });
  });

  it('rejeita item de livro inexistente', () => {
    cy.api('POST', '/customer/cart/items', { bookId: 999999, quantity: 1 }, user).then((r) => expectRejected(r, 404));
  });

  it('rejeita quantidade maior que o estoque disponível', () => {
    cy.api('POST', '/customer/cart/items', { bookId: 4, quantity: 1000000 }, user).then((r) => expectRejected(r));
  });

  it('rejeita atualização de item ausente no carrinho', () => {
    cy.api('PUT', '/customer/cart/items/4', { quantity: 1 }, user).then((r) => expectRejected(r, 404));
  });

  it('rejeita atualização sem estoque e preserva a quantidade anterior', () => {
    cy.prepareCart(user).then((cart) => {
      cy.api('PUT', `/customer/cart/items/${cart.product.id}`, { quantity: 1000000 }, user).then((r) => expectRejected(r));
      cy.api('GET', '/customer/cart', undefined, user).its('body.items.0.quantity').should('eq', 1);
    });
  });
});
