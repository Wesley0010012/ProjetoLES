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

  // Compras aprovadas não devolvem estoque. Para não alterar o livro de maior
  // estoque (usado por cy.exchangeToCoupon) nem o mais barato (usado por
  // cheapCart), compra um terceiro livro com folga de estoque.
  function neutralCart(minimumTotal: number) {
    return cy.api<any[]>('GET', '/books').then((r) => {
      const available = r.body.filter((b) => b.available);
      const mostStocked = [...available].sort((a, b) => b.availableQuantity - a.availableQuantity)[0];
      const cheapest = [...available].sort((a, b) => a.price - b.price)[0];
      const book = available
        .filter((b) => b.id !== mostStocked.id && b.id !== cheapest.id)
        .map((b) => ({ ...b, quantity: Math.floor(minimumTotal / b.price) + 1 }))
        .filter((b) => b.availableQuantity - b.quantity >= 1)
        .sort((a, b) => b.availableQuantity - a.availableQuantity)[0];
      expect(book, 'livro com estoque para o teste').to.exist;
      return cy.api('POST', '/customer/cart/items', { bookId: book.id, quantity: book.quantity }, user).then((r2) => {
        expect(r2.status).eq(201);
        return r2.body;
      });
    });
  }

  it('paga integralmente com cupom de troca e debita do próprio cupom apenas o valor usado', () => {
    cy.exchangeToCoupon(user, operator).then((coupon) => {
      cheapCart().then((cart) => {
        const total = Math.round((cart.subtotal + cart.estimatedFreight) * 100) / 100;
        expect(coupon.value).to.be.greaterThan(total);
        const remaining = Math.round((coupon.value - total) * 100) / 100;
        cy.visitAs('/customer/checkout', user);
        cy.contains('label', coupon.code).find('input').check();
        cy.contains('O total está coberto pelos cupons').should('be.visible');
        cy.intercept('POST', '/api/customer/checkout').as('checkout');
        cy.contains('button', 'Confirmar pedido').click();
        cy.wait('@checkout').then(({ request, response }) => {
          expect(response!.statusCode).eq(201);
          expect(request.body.cardPayments).to.be.empty;
          expect(response!.body.appliedCoupons).to.deep.equal([
            { code: coupon.code, applied: total, remaining, active: true },
          ]);
        });
        cy.api<any[]>('GET', '/customer/coupons', undefined, user).then((r) => {
          expect(r.body.filter((c) => c.type === 'EXCHANGE'), 'nenhum cupom de troco gerado').to.have.length(1);
          expect(r.body.find((c) => c.code === coupon.code).value).eq(remaining);
        });
      });
    });
  });

  it('desativa o cupom de troca quando o valor dele é totalmente consumido', () => {
    cy.exchangeToCoupon(user, operator).then((coupon) => {
      neutralCart(coupon.value).then((cart: any) => {
        const total = Math.round((cart.subtotal + cart.estimatedFreight) * 100) / 100;
        expect(total).to.be.greaterThan(coupon.value);
        const payable = Math.round((total - coupon.value) * 100) / 100;
        cy.api(
          'POST',
          '/customer/checkout',
          {
            addressId: user.profile!.addresses.find((a) => a.type === 'Delivery')!.id,
            cardPayments: [{ cardId: user.profile!.cards[0].id, amount: payable }],
            couponCodes: [coupon.code],
          },
          user,
        ).then((r) => {
          expect(r.status).eq(201);
          expect(r.body.appliedCoupons).to.deep.equal([
            { code: coupon.code, applied: coupon.value, remaining: 0, active: false },
          ]);
        });
        cy.api<any[]>('GET', '/customer/coupons', undefined, user).then((r) =>
          expect(r.body.map((c) => c.code)).not.to.include(coupon.code),
        );
      });
    });
  });

  it('não zera o cartão principal ao aplicar um cupom depois de dividir o pagamento', () => {
    cy.exchangeToCoupon(user, operator).then((coupon) => {
      cheapCart();
      cy.visitAs('/customer/checkout', user);
      cy.contains('label', '4444').find('input[type="checkbox"]').check().should('be.checked');
      cy.contains('label', coupon.code).find('input').check();
      cy.contains('label', '4444').find('input[type="checkbox"]').should('not.be.checked');
      cy.intercept('POST', '/api/customer/checkout').as('checkout');
      cy.contains('button', 'Confirmar pedido').click();
      cy.wait('@checkout').then(({ request, response }) => {
        expect(response!.statusCode).eq(201);
        // O cupom cobre o total (nenhum cartão) ou sobra um saldo pago só no principal.
        expect(request.body.cardPayments).to.have.length.at.most(1);
        request.body.cardPayments.forEach((p: any) => expect(p.amount).to.be.greaterThan(0));
      });
      cy.location('pathname').should('eq', '/customer/orders');
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
    cheapCart().as('cart');
    cy.get('@first').then((first: any) =>
      cy.get('@second').then((second: any) => {
        cy.get('@cart').then((cart: any) => {
          const total = cart.subtotal + cart.estimatedFreight;
          expect(first.value, 'cada cupom sozinho cobre o total').to.be.greaterThan(total);
          expect(second.value, 'cada cupom sozinho cobre o total').to.be.greaterThan(total);
        });
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
