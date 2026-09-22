import type { AuthSession } from '../../support/types';

describe('Assistant — interface', () => {
  let user: AuthSession;
  beforeEach(() => {
    cy.newCustomer().then((value) => (user = value));
    cy.task('provider', 'success');
  });

  const open = () => {
    cy.visitAs('/customer/catalog', user);
    cy.get('[aria-label="Abrir assistente"]').click();
    cy.get('[aria-label="Assistente Libra"]').should('be.visible');
  };
  const send = (question: string) => {
    cy.get('[aria-label="Mensagem para a assistente"]').type(question, { delay: 0 });
    cy.get('[aria-label="Enviar mensagem"]').click();
  };

  it('recomenda produtos reais e mantém o histórico entre mensagens', () => {
    open();
    cy.intercept('POST', '/api/assistant/messages').as('message');
    send('Indique livros sobre arquitetura de software');
    cy.wait('@message').then(({ response }) => {
      expect(response!.statusCode).eq(201);
      expect(response!.body.products).not.to.be.empty;
      cy.get('[aria-label="Assistente Libra"]').should('contain', response!.body.answer);
      send('Qual desses livros você recomenda?');
      cy.wait('@message').its('response.statusCode').should('eq', 201);
      cy.task('providerRequests').then((requests: any) => {
        expect(requests).to.have.length(2);
        expect(requests[1].contents.map((c: any) => c.role)).deep.eq(['user', 'model', 'user']);
      });
    });
  });

  it('abre o produto recomendado e fecha o assistente', () => {
    open();
    cy.intercept('POST', '/api/assistant/messages').as('message');
    send('Indique livros sobre arquitetura de software');
    cy.wait('@message');
    cy.get('[aria-label="Assistente Libra"] a[href^="/customer/products/"]').first().click();
    cy.location('pathname').should('match', /^\/customer\/products\/\d+$/);
    cy.get('[aria-label="Assistente Libra"]').should('not.exist');
  });

  it('impede o envio de mensagem vazia', () => {
    open();
    cy.get('[aria-label="Enviar mensagem"]').should('be.disabled');
    cy.get('[aria-label="Mensagem para a assistente"]').type('   ');
    cy.get('[aria-label="Enviar mensagem"]').should('be.disabled');
  });

  it('limita o tamanho máximo da mensagem', () => {
    open();
    cy.get('[aria-label="Mensagem para a assistente"]').should('have.attr', 'maxlength', '1000');
  });

  it('permite fechar o assistente', () => {
    open();
    cy.get('[aria-label="Assistente Libra"] [aria-label="Fechar assistente"]').click();
    cy.get('[aria-label="Assistente Libra"]').should('not.exist');
  });

  (['rate-limit', 'unavailable', 'empty', 'malformed', 'disconnect'] as const).forEach((mode) => {
    it(`trata falha do provedor de IA (${mode}) e permite nova mensagem`, () => {
      cy.task('provider', mode);
      open();
      cy.intercept('POST', '/api/assistant/messages').as('message');
      send('Recomende livros');
      cy.wait('@message').its('response.statusCode').should('eq', 503);
      cy.get('[aria-label="Assistente Libra"]').should('contain.text', 'indisponível');
      cy.task('provider', 'success');
      send('Como acompanho meu pedido?');
      cy.wait('@message').its('response.statusCode').should('eq', 201);
      cy.get('[aria-label="Assistente Libra"]').contains('a', 'Ver pedidos e trocas').should('be.visible');
    });
  });

  it('trata queda de rede do navegador', () => {
    cy.intercept('POST', '/api/assistant/messages', { forceNetworkError: true });
    open();
    send('Recomende livros');
    cy.get('[aria-label="Assistente Libra"]').contains('p', /fetch|conexão|rede|assistente/i).should('be.visible');
    cy.get('[aria-label="Mensagem para a assistente"]').should('be.enabled');
  });
});

describe('Assistant API — validações', () => {
  let user: AuthSession;
  beforeEach(() => cy.newCustomer().then((value) => (user = value)));

  ([undefined, '', '   ', 1, 'a'.repeat(1001)] as const).forEach((message, index) => {
    it(`rejeita mensagem inválida (caso ${index + 1})`, () => {
      cy.api('POST', '/assistant/messages', { message }, user).then((r) => {
        expect(r.status, JSON.stringify(r.body)).eq(400);
        expect(r.body.message).to.be.a('string').and.not.empty;
      });
    });
  });

  it('exige autenticação para conversar com o assistente', () => {
    cy.api('POST', '/assistant/messages', { message: 'Recomende livros' }).then((r) => {
      expect(r.status, JSON.stringify(r.body)).eq(401);
      expect(r.body.message).to.be.a('string').and.not.empty;
    });
  });
});
