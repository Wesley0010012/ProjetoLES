import { expectRejected } from '../../support/assertions';
import { card } from '../../support/fixtures';
import type { AuthSession } from '../../support/types';

describe('Cards API — validações', () => {
  let user: AuthSession;
  beforeEach(() => cy.newCustomer().then((value) => (user = value)));

  (['number', 'printedName', 'brand', 'securityCode', 'preferred'] as const).forEach((field) => {
    it(`rejeita cartão sem o campo ${field}`, () => {
      const body: any = card();
      delete body[field];
      cy.api('POST', `/users/${user.userId}/customer/cards`, body, user).then((r) => expectRejected(r));
    });
  });

  ([
    ['number', '123'],
    ['number', '4242424242424241'],
    ['brand', 'INVALID'],
    ['brand', 'MASTERCARD'],
    ['securityCode', '12'],
    ['securityCode', '1234'],
    ['printedName', 'Um'],
    ['preferred', 'sim'],
  ] as const).forEach(([field, value]) => {
    it(`rejeita cartão com ${field}=${value}`, () => {
      cy.api('POST', `/users/${user.userId}/customer/cards`, { ...card(), [field]: value }, user).then((r) => expectRejected(r));
    });
  });

  it('rejeita exclusão de cartão inexistente', () => {
    cy.api('DELETE', `/users/${user.userId}/customer/cards/999999`, undefined, user).then((r) => expectRejected(r, 404));
  });

  it('impede acesso a cartão de outro cliente', () => {
    cy.newCustomer().then((other) => {
      const id = other.profile!.cards[0].id;
      cy.api('DELETE', `/users/${user.userId}/customer/cards/${id}`, undefined, user).then((r) => expectRejected(r, 404));
    });
  });
});
