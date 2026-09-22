import { expectRejected } from '../../support/assertions';
import type { AuthSession } from '../../support/types';

describe('Auth API — autenticação e autorização', () => {
  let user: AuthSession, operator: AuthSession;
  beforeEach(() => {
    cy.newCustomer().then((value) => {
      user = value;
    });
    cy.admin().then((value) => {
      operator = value;
    });
  });

  (['/customer/orders', '/customer/coupons', '/customer/cart', '/admin/customers', '/admin/sales', '/admin/sales/exchanges'] as const).forEach(
    (path) => {
      it(`exige autenticação em ${path}`, () => {
        cy.api('GET', path).then((r) => expectRejected(r, 401));
      });

      it(`rejeita token inválido em ${path}`, () => {
        cy.api('GET', path, undefined, { token: 'invalido' } as AuthSession).then((r) => expectRejected(r, 401));
      });
    },
  );

  (['/admin/customers', '/admin/sales', '/admin/sales/exchanges'] as const).forEach((path) => {
    it(`cliente não pode consultar ${path}`, () => {
      cy.api('GET', path, undefined, user).then((r) => expectRejected(r, 403));
    });
  });

  (['/customer/orders', '/customer/coupons', '/customer/cart'] as const).forEach((path) => {
    it(`operador não pode consultar ${path}`, () => {
      cy.api('GET', path, undefined, operator).then((r) => expectRejected(r, 403));
    });
  });

  it('impede cliente de consultar o cadastro de outro cliente', () => {
    cy.newCustomer().then((other) => {
      cy.api('GET', `/users/${other.userId}/customer`, undefined, user).then((r) => expectRejected(r, 403));
    });
  });

  it('impede cliente de inativar o cadastro de outro cliente', () => {
    cy.newCustomer().then((other) => {
      cy.api('DELETE', `/users/${other.userId}/customer`, undefined, user).then((r) => expectRejected(r, 403));
    });
  });

  it('rejeita requisições após encerrar a sessão', () => {
    cy.api('POST', '/auth/sign-out', {}, user).its('status').should('eq', 204);
    cy.api('GET', '/customer/orders', undefined, user).then((r) => expectRejected(r, 401));
  });
});
