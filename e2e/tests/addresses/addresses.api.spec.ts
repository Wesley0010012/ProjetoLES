import { expectRejected } from '../../support/assertions';
import { address, profile } from '../../support/fixtures';
import type { AuthSession } from '../../support/types';

describe('Addresses API — validações', () => {
  let user: AuthSession;
  beforeEach(() => cy.newCustomer().then((value) => (user = value)));

  (
    ['name', 'street', 'number', 'district', 'zipCode', 'city', 'state', 'country', 'residenceType', 'streetType', 'type'] as const
  ).forEach((field) => {
    it(`rejeita endereço sem o campo ${field}`, () => {
      const body: any = address();
      delete body[field];
      cy.api('POST', `/users/${user.userId}/customer/addresses`, body, user).then((r) => expectRejected(r));
    });
  });

  ([
    ['zipCode', '123'],
    ['residenceType', 'INVALID'],
    ['streetType', 'INVALID'],
    ['type', 'INVALID'],
  ] as const).forEach(([field, value]) => {
    it(`rejeita endereço com ${field} inválido`, () => {
      cy.api('POST', `/users/${user.userId}/customer/addresses`, { ...address(), [field]: value }, user).then((r) => expectRejected(r));
    });
  });

  (['Primary', 'Billing', 'Delivery'] as const).forEach((type) => {
    it(`protege a remoção do último endereço do tipo ${type}`, () => {
      const id = user.profile!.addresses.find((a) => a.type === type)!.id;
      cy.api('DELETE', `/users/${user.userId}/customer/addresses/${id}`, undefined, user).then((r) => expectRejected(r));
    });
  });

  it('rejeita exclusão de endereço inexistente', () => {
    cy.api('DELETE', `/users/${user.userId}/customer/addresses/999999`, undefined, user).then((r) => expectRejected(r, 404));
  });

  it('impede acesso a endereço de outro cliente', () => {
    cy.newCustomer().then((other) => {
      const id = other.profile!.addresses[0].id;
      cy.api('DELETE', `/users/${user.userId}/customer/addresses/${id}`, undefined, user).then((r) => expectRejected(r, 404));
    });
  });

  it('rejeita CPF duplicado ao alterar o cadastro', () => {
    cy.newCustomer().then((other) => {
      cy.api('PUT', `/users/${user.userId}/customer`, { ...profile(other.document!), email: user.email }, user).then((r) =>
        expectRejected(r, 400),
      );
    });
  });
});
