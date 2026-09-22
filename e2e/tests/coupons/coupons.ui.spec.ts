import type { AuthSession } from '../../support/types';

describe('Coupons — interface', () => {
  let user: AuthSession;
  beforeEach(() => cy.newCustomer().then((value) => (user = value)));

  it('consulta o cupom promocional real', () => {
    cy.visitAs('/customer/coupons', user);
    cy.contains('article', 'LIBRA10').should('contain', '10%').and('contain', 'Promocional');
  });

  it('mostra erro de consulta dos cupons', () => {
    cy.intercept('GET', '/api/customer/coupons', { statusCode: 503, body: { message: 'Cupons indisponíveis' } });
    cy.visitAs('/customer/coupons', user);
    cy.contains('Cupons indisponíveis').should('be.visible');
  });

  it('mostra o estado vazio quando não há cupons disponíveis', () => {
    cy.intercept('GET', '/api/customer/coupons', { body: [] });
    cy.visitAs('/customer/coupons', user);
    cy.contains('Nenhum cupom disponível').should('be.visible');
  });
});
