import { identity, PASSWORD } from '../../support/fixtures';

describe('Auth — cadastro pela interface', () => {
  it('cria a conta e o perfil completo e chega à área do cliente', () => {
    const data = identity();
    cy.intercept('POST', '/api/auth/sign-up').as('signup');
    cy.visit('/sign-up');
    cy.field('email', data.email);
    cy.field('password', PASSWORD);
    cy.field('passwordConfirmation', PASSWORD);
    cy.contains('button', 'Criar minha conta').click();
    cy.wait('@signup').its('response.statusCode').should('eq', 201);
    cy.location('pathname').should('eq', '/customer/complete-profile');

    cy.field('name', 'Cliente Cadastro Cypress');
    cy.field('document', data.document);
    cy.field('birthDate', '1995-01-01');
    cy.get('[name="gender"]').select('MAN');
    cy.get('[name="phoneType"]').select('MOBILE');
    cy.field('phoneDdd', '11');
    cy.field('phoneNumber', '987654321');
    [0, 1, 2].forEach((index) => cy.fillAddress(`address-${index}-`));
    cy.contains('button', 'Salvar e continuar').click();

    cy.location('pathname').should('eq', '/customer/account');
    cy.contains('h1', 'Olá, Cliente').should('be.visible');
    cy.contains('a', 'Endereços').should('contain', '3 endereços cadastrados');
  });

  it('cadastra três tipos de endereço distintos durante o autocompletar de perfil', () => {
    const data = identity();
    cy.intercept('POST', '/api/auth/sign-up').as('signup');
    cy.visit('/sign-up');
    cy.field('email', data.email);
    cy.field('password', PASSWORD);
    cy.field('passwordConfirmation', PASSWORD);
    cy.contains('button', 'Criar minha conta').click();
    cy.wait('@signup');
    cy.field('name', 'Cliente Cadastro Cypress');
    cy.field('document', data.document);
    cy.field('birthDate', '1995-01-01');
    cy.get('[name="gender"]').select('MAN');
    cy.get('[name="phoneType"]').select('MOBILE');
    cy.field('phoneDdd', '11');
    cy.field('phoneNumber', '987654321');
    [0, 1, 2].forEach((index) => cy.fillAddress(`address-${index}-`));
    cy.contains('button', 'Salvar e continuar').click();
    cy.window().then((win) => {
      const session = JSON.parse(win.sessionStorage.getItem('libra.authentication.USER')!);
      cy.api('GET', `/users/${session.userId}/customer`, undefined, session).then((r) => {
        expect(new Set(r.body.addresses.map((a: any) => a.id)).size).eq(3);
        expect(r.body.addresses.map((a: any) => a.type).sort()).deep.eq(['Billing', 'Delivery', 'Primary']);
      });
    });
  });

  it('rejeita e-mail vazio no envio do formulário', () => {
    cy.visit('/sign-up');
    cy.contains('button', 'Criar minha conta').click();
    cy.get('[name="email"]').then(($input) => expect(($input[0] as HTMLInputElement).validity.valueMissing).eq(true));
  });

  it('rejeita e-mail com formato inválido', () => {
    cy.visit('/sign-up');
    cy.field('email', 'invalido');
    cy.get('[name="email"]').then(($input) => expect(($input[0] as HTMLInputElement).validity.typeMismatch).eq(true));
    cy.location('pathname').should('eq', '/sign-up');
  });

  ([
    ['senha sem requisitos', 'abcdefgh', 'abcdefgh', /senha/i],
    ['confirmação divergente', PASSWORD, 'OutraSenha@123', /confirm|iguais|coincid/i],
  ] as const).forEach(([title, first, second, error]) => {
    it(`rejeita ${title}`, () => {
      cy.visit('/sign-up');
      cy.field('email', identity().email);
      cy.field('password', first);
      cy.field('passwordConfirmation', second);
      cy.contains('button', 'Criar minha conta').click();
      cy.get('[role="alert"]').should('be.visible');
      cy.get('[role="alert"]').invoke('text').should('match', error);
      cy.location('pathname').should('eq', '/sign-up');
    });
  });

  it('rejeita e-mail duplicado sem trocar a sessão', () => {
    cy.newCustomer().then((user) => {
      cy.visit('/sign-up');
      cy.field('email', user.email!);
      cy.field('password', PASSWORD);
      cy.field('passwordConfirmation', PASSWORD);
      cy.intercept('POST', '/api/auth/sign-up').as('duplicate');
      cy.contains('button', 'Criar minha conta').click();
      cy.wait('@duplicate').its('response.statusCode').should('eq', 400);
      cy.get('[role="alert"]').should('be.visible');
      cy.location('pathname').should('eq', '/sign-up');
    });
  });
});
