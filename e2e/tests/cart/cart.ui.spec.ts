import type { AuthSession } from '../../support/types';

describe('Cart — interface', () => {
  let user: AuthSession;
  beforeEach(() => cy.newCustomer().then((value) => (user = value)));

  it('adiciona um item pela página do produto', () => {
    cy.visitAs('/customer/products/4', user);
    cy.get('h1').should('be.visible');
    cy.contains('button', 'Adicionar ao carrinho').first().click();
    cy.location('pathname').should('eq', '/customer/cart');
  });

  it('aumenta e reduz a quantidade de um item', () => {
    cy.visitAs('/customer/products/4', user);
    cy.contains('button', 'Adicionar ao carrinho').first().click();
    cy.intercept('PUT', '/api/customer/cart/items/4').as('quantity');
    cy.get('article select').select('3');
    cy.wait('@quantity').its('response.body.items.0.quantity').should('eq', 3);
    cy.contains('Subtotal (3 itens)').should('be.visible');
    cy.get('article select').select('1');
    cy.wait('@quantity').its('response.body.items.0.quantity').should('eq', 1);
  });

  it('pede confirmação antes de remover um item e permite desistir', () => {
    cy.visitAs('/customer/products/4', user);
    cy.contains('button', 'Adicionar ao carrinho').first().click();
    cy.on('window:confirm', () => false);
    cy.contains('button', 'Excluir').click();
    cy.get('article select').should('have.value', '1');
  });

  it('remove o item confirmando a exclusão e esvazia o carrinho', () => {
    cy.visitAs('/customer/products/4', user);
    cy.contains('button', 'Adicionar ao carrinho').first().click();
    cy.on('window:confirm', () => true);
    cy.contains('button', 'Excluir').click();
    cy.contains('Seu carrinho está vazio').should('be.visible');
    cy.contains('a', 'Fechar pedido').should('have.attr', 'aria-disabled', 'true');
  });

  it('exibe falha de atualização sem modificar a quantidade', () => {
    cy.prepareCart(user);
    cy.intercept('PUT', '/api/customer/cart/items/*', { statusCode: 400, body: { message: 'Estoque insuficiente' } });
    cy.visitAs('/customer/cart', user);
    cy.get('article select').select('2');
    cy.contains('Estoque insuficiente').should('be.visible');
    cy.get('article select').should('have.value', '1');
  });

  (['cart', 'checkout'] as const).forEach((page) => {
    it(`exibe falha de carregamento em /customer/${page}`, () => {
      cy.prepareCart(user);
      cy.intercept('GET', '/api/customer/cart', { statusCode: 503, body: { message: 'Carrinho indisponível' } });
      cy.visitAs(`/customer/${page}`, user);
      cy.contains('Carrinho indisponível').should('be.visible');
    });
  });

  it('redireciona o checkout vazio para o carrinho', () => {
    cy.visitAs('/customer/checkout', user);
    cy.location('pathname').should('eq', '/customer/cart');
    cy.contains('Seu carrinho está vazio').should('be.visible');
  });
});
