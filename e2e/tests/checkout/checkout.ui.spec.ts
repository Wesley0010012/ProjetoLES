import type { AuthSession } from '../../support/types';

describe('Checkout — interface', () => {
  let user: AuthSession;
  beforeEach(() => cy.newCustomer().then((value) => (user = value)));

  it('realiza pedido com endereço cadastrado e um cartão, esvaziando o carrinho', () => {
    cy.prepareCart(user);
    cy.visitAs('/customer/checkout', user);
    cy.get('[name="addressId"]:checked').should('exist');
    cy.intercept('POST', '/api/customer/checkout').as('checkout');
    cy.contains('button', 'Confirmar pedido').click();
    cy.wait('@checkout').then(({ request, response }) => {
      expect(response!.statusCode).eq(201);
      expect(response!.body.status).eq('EM_ABERTO');
      expect(request.body.cardPayments).to.have.length(1);
      cy.location('pathname').should('eq', '/customer/orders');
      cy.contains('article', response!.body.code).should('contain.text', 'Em aberto');
    });
    cy.api('GET', '/customer/cart', undefined, user).its('body.items').should('have.length', 0);
  });

  it('adiciona endereço e cartão durante a compra e paga com dois cartões e cupom', () => {
    cy.prepareCart(user, 2);
    cy.visitAs('/customer/checkout', user);
    cy.contains('a', 'Novo endereço').click();
    cy.fillAddress();
    cy.contains('button', 'Criar endereço').click();
    cy.location('pathname').should('eq', '/customer/checkout');
    cy.contains('a', 'Novo cartão').click();
    cy.fillCard({ number: '4012888888881881' });
    cy.contains('button', 'Criar cartão').click();
    cy.location('pathname').should('eq', '/customer/checkout');
    cy.contains('label', 'Nova entrega Cypress').find('input').check();
    cy.contains('label', '1881').find('input[type="checkbox"]').check();
    cy.contains('label', 'LIBRA10').find('input').check();
    cy.intercept('POST', '/api/customer/checkout').as('checkout');
    cy.contains('button', 'Confirmar pedido').click();
    cy.wait('@checkout').then(({ request, response }) => {
      expect(response!.statusCode).eq(201);
      expect(request.body.cardPayments).to.have.length(2);
      expect(request.body.couponCodes).deep.eq(['LIBRA10']);
      cy.contains('article', response!.body.code).contains('button', 'Ver resumo').click();
      cy.get('[role="dialog"]').should('contain', 'Nova entrega Cypress').and('contain', '1881').and('contain', 'LIBRA10');
    });
  });

  it('combina vários cupons de troca, cupom promocional e vários cartões', () => {
    cy.admin().then((operator) => {
      cy.exchangeToCoupon(user, operator).as('coupon1');
      cy.exchangeToCoupon(user, operator).as('coupon2');
    });
    cy.prepareCart(user, 5);
    cy.visitAs('/customer/checkout', user);
    cy.get('@coupon1').then((coupon: any) => cy.contains('label', coupon.code).find('input').check());
    cy.get('@coupon2').then((coupon: any) => cy.contains('label', coupon.code).find('input').check());
    cy.contains('label', 'LIBRA10').find('input').check();
    cy.contains('label', '4444').find('input[type="checkbox"]').check();
    cy.intercept('POST', '/api/customer/checkout').as('checkout');
    cy.contains('button', 'Confirmar pedido').click();
    cy.wait('@checkout').then(({ request, response }) => {
      expect(response!.statusCode).eq(201);
      expect(request.body.couponCodes).to.have.length(3);
      expect(request.body.cardPayments).to.have.length(2);
    });
    cy.location('pathname').should('eq', '/customer/orders');
  });

  it('impede a compra sem nenhum cartão selecionado', () => {
    cy.prepareCart(user);
    cy.visitAs('/customer/checkout', user);
    cy.contains('label', '4242').find('input').uncheck();
    cy.contains('button', 'Confirmar pedido').click();
    cy.contains('Selecione ao menos um cartão').should('be.visible');
  });

  ([
    ['0,00', 'valor maior que zero'],
    ['5,00', 'ao menos R$ 10,00'],
    ['999999,00', 'valor maior que zero'],
  ] as const).forEach(([amount, error]) => {
    it(`recusa distribuição de pagamento inválida: ${amount}`, () => {
      cy.prepareCart(user);
      cy.visitAs('/customer/checkout', user);
      cy.contains('label', '4444').find('input[type="checkbox"]').check();
      cy.get('#checkout-form input[inputmode="decimal"]:enabled').type(`{selectall}${amount}`, { delay: 0 });
      cy.contains('button', 'Confirmar pedido').click();
      cy.contains(error).should('be.visible');
      cy.location('pathname').should('eq', '/customer/checkout');
    });
  });

  it('mantém o checkout utilizável após erro do servidor', () => {
    cy.prepareCart(user);
    cy.intercept({ method: 'POST', url: '/api/customer/checkout', times: 1 }, { statusCode: 503, body: { message: 'Pagamento indisponível' } });
    cy.visitAs('/customer/checkout', user);
    cy.contains('button', 'Confirmar pedido').click();
    cy.contains('Pagamento indisponível').should('be.visible');
    cy.contains('button', 'Confirmar pedido').should('be.enabled').click();
    cy.location('pathname').should('eq', '/customer/orders');
  });

  it('exibe pedido reprovado quando o cartão de demonstração recusa o pagamento', () => {
    cy.newCustomer({
      cards: [{ number: '4000000000000002', printedName: 'Cliente Teste', brand: 'VISA', securityCode: '123', preferred: true }],
    }).then((declined) => {
      cy.prepareCart(declined);
      cy.visitAs('/customer/checkout', declined);
      cy.intercept('POST', '/api/customer/checkout').as('declined');
      cy.contains('button', 'Confirmar pedido').click();
      cy.wait('@declined').its('response.body.status').should('eq', 'REPROVADA');
      cy.contains('article', 'Reprovada').should('be.visible');
    });
  });
});
