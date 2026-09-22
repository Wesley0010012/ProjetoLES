import type { Coupon, AuthSession } from '../../support/types';

describe('Coupons API — reuso e consumo', () => {
  let user: AuthSession, operator: AuthSession, coupon: Coupon;
  beforeEach(() => {
    cy.newCustomer().then((value) => (user = value));
    cy.admin().then((value) => (operator = value));
    cy.then(() => cy.exchangeToCoupon(user, operator).then((value) => (coupon = value)));
  });

  const buyWithCoupon = (session: AuthSession, couponCodes: string[], useCard = true) =>
    cy.prepareCart(session).then((cart) => {
      const total = Math.round((cart.subtotal + cart.estimatedFreight) * 100) / 100;
      return cy.api(
        'POST',
        '/customer/checkout',
        {
          addressId: session.profile!.addresses.find((a) => a.type === 'Delivery')!.id,
          couponCodes,
          cardPayments: useCard
            ? [{ cardId: session.profile!.cards[0].id!, amount: Math.max(0.01, Math.round((total - coupon.value) * 100) / 100) }]
            : [],
        },
        session,
      );
    });

  it('impede usar cupom de outro cliente', () => {
    cy.newCustomer().then((other) => {
      buyWithCoupon(other, [coupon.code]).then((r) => {
        expect(r.status, JSON.stringify(r.body)).eq(400);
        expect(r.body.message).to.be.a('string').and.not.empty;
      });
      cy.api('GET', '/customer/coupons', undefined, other).then((r) => expect(r.body.map((c: Coupon) => c.code)).not.include(coupon.code));
    });
  });

  it('consome o cupom uma única vez', () => {
    buyWithCoupon(user, [coupon.code]).its('status').should('eq', 201);
    cy.api('GET', '/customer/coupons', undefined, user).then((r) => expect(r.body.map((c: Coupon) => c.code)).not.include(coupon.code));
    buyWithCoupon(user, [coupon.code]).then((r) => {
      expect(r.status, JSON.stringify(r.body)).eq(400);
      expect(r.body.message).to.be.a('string').and.not.empty;
    });
  });
});
