import { expectRejected } from '../../support/assertions';
import type { CheckoutPayload, AuthSession } from '../../support/types';

describe('Checkout API — validações', () => {
  let user: AuthSession;
  let payload: CheckoutPayload;

  beforeEach(() =>
    cy.newCustomer().then((value) => {
      user = value;
      return cy.prepareCart(user).then((cart) => {
        payload = {
          addressId: user.profile!.addresses.find((a) => a.type === 'Delivery')!.id,
          cardPayments: [{ cardId: user.profile!.cards[0].id!, amount: Math.round((cart.subtotal + cart.estimatedFreight) * 100) / 100 }],
          couponCodes: [],
        };
      });
    }),
  );

  function expectCheckoutRejected(mutate: (body: any, user: AuthSession) => void) {
    const body: any = JSON.parse(JSON.stringify(payload));
    mutate(body, user);
    cy.api('POST', '/customer/checkout', body, user).then((r) => expectRejected(r));
    cy.api('GET', '/customer/cart', undefined, user).its('body.items').should('have.length', 1);
    cy.api('GET', '/customer/orders', undefined, user).its('body').should('be.empty');
  }

  it('rejeita checkout sem endereço', () => expectCheckoutRejected((b) => delete b.addressId));
  it('rejeita checkout com endereço inexistente', () => expectCheckoutRejected((b) => (b.addressId = 999999)));
  it('rejeita entrega no endereço principal', () =>
    expectCheckoutRejected((b, u) => (b.addressId = u.profile!.addresses.find((a) => a.type === 'Primary')!.id)));
  it('rejeita entrega no endereço de cobrança', () =>
    expectCheckoutRejected((b, u) => (b.addressId = u.profile!.addresses.find((a) => a.type === 'Billing')!.id)));
  it('rejeita checkout sem lista de pagamentos', () => expectCheckoutRejected((b) => delete b.cardPayments));
  it('rejeita pagamentos que não são uma lista', () => expectCheckoutRejected((b) => (b.cardPayments = {})));
  it('rejeita lista de pagamentos vazia', () => expectCheckoutRejected((b) => (b.cardPayments = [])));
  it('rejeita pagamento nulo na lista', () => expectCheckoutRejected((b) => (b.cardPayments = [null])));
  it('rejeita cartão de pagamento inexistente', () => expectCheckoutRejected((b) => (b.cardPayments[0].cardId = 999999)));
  it('rejeita valor de pagamento igual a zero', () => expectCheckoutRejected((b) => (b.cardPayments[0].amount = 0)));
  it('rejeita valor de pagamento negativo', () => expectCheckoutRejected((b) => (b.cardPayments[0].amount = -1)));
  it('rejeita valor de pagamento não numérico', () => expectCheckoutRejected((b) => (b.cardPayments[0].amount = 'abc')));
  it('rejeita soma de pagamentos menor que o total', () => expectCheckoutRejected((b) => (b.cardPayments[0].amount -= 1)));
  it('rejeita soma de pagamentos maior que o total', () => expectCheckoutRejected((b) => (b.cardPayments[0].amount += 1)));
  it('rejeita valor de cartão abaixo do mínimo de R$10 quando combinado', () =>
    expectCheckoutRejected((b, u) => {
      b.cardPayments[0].amount -= 5;
      b.cardPayments.push({ cardId: u.profile!.cards[1].id, amount: 5 });
    }));
  it('rejeita o mesmo cartão repetido na lista de pagamentos', () =>
    expectCheckoutRejected((b) => {
      b.cardPayments[0].amount /= 2;
      b.cardPayments.push({ ...b.cardPayments[0] });
    }));
  it('rejeita checkout sem lista de cupons', () => expectCheckoutRejected((b) => delete b.couponCodes));
  it('rejeita cupons que não são uma lista', () => expectCheckoutRejected((b) => (b.couponCodes = {})));
  it('rejeita código de cupom não textual', () => expectCheckoutRejected((b) => (b.couponCodes = [1])));
  it('rejeita cupom inexistente', () => expectCheckoutRejected((b) => (b.couponCodes = ['INEXISTENTE'])));
  it('rejeita cupom repetido na mesma compra', () => expectCheckoutRejected((b) => (b.couponCodes = ['LIBRA10', 'LIBRA10'])));
  it('rejeita cupom repetido após normalização (espaços/maiúsculas)', () =>
    expectCheckoutRejected((b) => (b.couponCodes = ['LIBRA10', ' libra10 '])));

  it('rejeita endereço e cartão pertencentes a outro cliente', () => {
    cy.newCustomer().then((other) => {
      cy.api('POST', '/customer/checkout', { ...payload, addressId: other.profile!.addresses.find((a) => a.type === 'Delivery')!.id }, user).then(
        (r) => expectRejected(r),
      );
      const withOtherCard = { ...payload, cardPayments: [{ ...payload.cardPayments[0], cardId: other.profile!.cards[0].id! }] };
      cy.api('POST', '/customer/checkout', withOtherCard, user).then((r) => expectRejected(r));
    });
  });

  it('rejeita checkout com carrinho vazio', () => {
    cy.api('GET', '/customer/cart', undefined, user).then((r) =>
      cy.api('DELETE', `/customer/cart/items/${r.body.items[0].bookId}`, undefined, user),
    );
    cy.api('POST', '/customer/checkout', payload, user).then((r) => expectRejected(r));
  });
});
