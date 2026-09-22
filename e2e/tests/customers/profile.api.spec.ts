import { expectRejected } from '../../support/assertions';
import { identity, PASSWORD, profile } from '../../support/fixtures';
import type { AuthSession } from '../../support/types';

describe('Customers API — validações de perfil incompleto', () => {
  let user: any, data: ReturnType<typeof identity>;
  beforeEach(() => {
    data = identity();
    cy.api('POST', '/auth/sign-up', { email: data.email, password: PASSWORD, passwordConfirmation: PASSWORD }).then((r) => {
      user = r.body;
    });
  });

  const invalidCases: Array<[string, (body: any) => void]> = [
    ['nome vazio', (b) => (b.name = ' ')],
    ['CPF inválido', (b) => (b.document = '11111111111')],
    ['data futura', (b) => (b.birthDate = '2099-01-01')],
    ['data inválida', (b) => (b.birthDate = 'data')],
    ['gênero inválido', (b) => (b.gender = 'INVALID')],
    ['tipo de telefone inválido', (b) => (b.phoneType = 'INVALID')],
    ['DDD inválido', (b) => (b.phoneDdd = '1')],
    ['telefone inválido', (b) => (b.phoneNumber = '1')],
    ['endereços vazios', (b) => (b.addresses = [])],
    ['endereços como objeto', (b) => (b.addresses = {})],
    ['cartões que não são lista', (b) => (b.cards = {})],
    ...(['Primary', 'Billing', 'Delivery'] as const).map(
      (type): [string, (body: any) => void] => [
        `sem endereço do tipo ${type}`,
        (b) => (b.addresses = b.addresses.filter((a: any) => a.type !== type)),
      ],
    ),
  ];

  invalidCases.forEach(([title, mutate]) => {
    it(`rejeita ${title} e mantém o perfil incompleto`, () => {
      const body = profile(data.document);
      mutate(body);
      cy.api('POST', `/users/${user.userId}/customer`, body, user as AuthSession).then((r) => expectRejected(r));
      cy.api('GET', `/users/${user.userId}/customer`, undefined, user as AuthSession).its('body.complete').should('eq', false);
    });
  });

  it('impede comprar sem completar o perfil', () => {
    cy.api('POST', '/customer/cart/items', { bookId: 4, quantity: 1 }, user as AuthSession).then((r) => expectRejected(r));
  });
});
