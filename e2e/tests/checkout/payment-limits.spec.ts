import { card } from '../../support/fixtures';
import type { AuthSession } from '../../support/types';

describe('Checkout — limites de cupons e pagamentos', () => {
  let user: AuthSession, operator: AuthSession;
  beforeEach(() => {
    cy.newCustomer().then((value) => (user = value));
    cy.admin().then((value) => (operator = value));
  });

  function cheapCart() {
    return cy.api<any[]>('GET', '/books').then((r) => {
      const book = r.body.filter((b) => b.available).sort((a, b) => a.price - b.price)[0];
      return cy.api('POST', '/customer/cart/items', { bookId: book.id, quantity: 1 }, user).then((r2) => {
        expect(r2.status).eq(201);
        return r2.body;
      });
    });
  }

  it('paga integralmente com cupom de troca e recebe crédito do excedente', () => {
    cy.exchangeToCoupon(user, operator).then((coupon) => {
      cheapCart().then((cart) => expect(coupon.value).to.be.greaterThan(cart.subtotal + cart.estimatedFreight));
      cy.visitAs('/customer/checkout', user);
      cy.contains('label', coupon.code).find('input').check();
      cy.intercept('POST', '/api/customer/checkout').as('checkout');
      cy.contains('button', 'Confirmar pedido').click();
      cy.wait('@checkout').then(({ request, response }) => {
        expect(response!.statusCode).eq(201);
        expect(request.body.cardPayments).to.be.empty;
        expect(response!.body.generatedCoupon.value).to.be.greaterThan(0);
        cy.visitAs('/customer/coupons', user);
        cy.contains('article', response!.body.generatedCoupon.code).should('be.visible');
        cy.contains('article', coupon.code).should('not.exist');
      });
    });
  });

  it('aceita um saldo residual menor que R$10 combinado com outro cartão e cupom', () => {
    cy.prepareCart(user, 2).then((cart) => {
      const total = Math.round((cart.subtotal + cart.estimatedFreight) * 90) / 100;
      cy.visitAs('/customer/checkout', user);
      cy.contains('label', 'LIBRA10').find('input').check();
      cy.contains('label', '4444').find('input[type="checkbox"]').check();
      cy.get('#checkout-form input[inputmode="decimal"]:enabled').type(`{selectall}${(total - 5).toFixed(2).replace('.', ',')}`, {
        delay: 0,
      });
      cy.intercept('POST', '/api/customer/checkout').as('checkout');
      cy.contains('button', 'Confirmar pedido').click();
      cy.wait('@checkout').then(({ request, response }) => {
        expect(response!.statusCode).eq(201);
        expect(request.body.cardPayments.map((p: any) => p.amount)).to.include(5);
      });
    });
  });

  it('rejeita cupons de troca redundantes que já excedem o total', () => {
    cy.exchangeToCoupon(user, operator).as('first');
    cy.exchangeToCoupon(user, operator).as('second');
    cheapCart();
    cy.get('@first').then((first: any) =>
      cy.get('@second').then((second: any) => {
        cy.api(
          'POST',
          '/customer/checkout',
          { addressId: user.profile!.addresses.find((a) => a.type === 'Delivery')!.id, cardPayments: [], couponCodes: [first.code, second.code] },
          user,
        )
          .its('status')
          .should('eq', 400);
      }),
    );
  });

  it('não consome cupom nem estoque quando o pagamento é reprovado', () => {
    cy.exchangeToCoupon(user, operator).then((coupon) => {
      cy.api('POST', `/users/${user.userId}/customer/cards`, card({ number: '4000000000000002', preferred: false }), user).then((r) => {
        const cardId = r.body.id;
        cy.prepareCart(user, 3).then((cart) => {
          const payable = Math.round((cart.subtotal + cart.estimatedFreight - coupon.value) * 100) / 100;
          cy.api(
            'POST',
            '/customer/checkout',
            { addressId: user.profile!.addresses.find((a) => a.type === 'Delivery')!.id, cardPayments: [{ cardId, amount: payable }], couponCodes: [coupon.code] },
            user,
          ).then((r2) => {
            expect(r2.status).eq(201);
            expect(r2.body.status).eq('REPROVADA');
          });
          cy.api('GET', '/customer/coupons', undefined, user).then((r2) => expect(r2.body.map((c: any) => c.code)).to.include(coupon.code));
          cy.api('GET', `/books/${cart.product.id}`).its('body.availableQuantity').should('eq', cart.product.availableQuantity);
        });
      });
    });
  });

  it('novo cliente sem cartões precisa cadastrar um cartão para pagar saldo positivo', () => {
    cy.newCustomer({ cards: [] }).then((noCards) => {
      cy.prepareCart(noCards);
      cy.visitAs('/customer/checkout', noCards);
      cy.contains('Nenhum cartão cadastrado.').should('be.visible');
      cy.contains('button', 'Confirmar pedido').should('be.disabled');
      cy.contains('a', 'Novo cartão').should('be.visible');
    });
  });
});
