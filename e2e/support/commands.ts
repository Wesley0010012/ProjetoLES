// Registra os comandos custom do Cypress como fachada ergonômica sobre
// support/scenarios.ts e support/api-client.ts. É a segunda (e última)
// camada acoplada à ferramenta — specs usam apenas `cy.<comando>`.

import { api } from './api-client';
import { address, card } from './fixtures';
import * as scenarios from './scenarios';
import type { Address, AdvanceStep, AuthSession, Card, Coupon, Exchange, PreparedCart, ProfileOverrides, Sale } from './types';

Cypress.Commands.add('api', (method, path, body, session) => api.request(method, path, body, session));

Cypress.Commands.add('newCustomer', (overrides?: ProfileOverrides) => scenarios.newCustomer(overrides));

Cypress.Commands.add('admin', () => scenarios.admin());

Cypress.Commands.add('prepareCart', (session: AuthSession, quantity?: number) => scenarios.prepareCart(session, quantity));

Cypress.Commands.add('placeOrder', (session: AuthSession, quantity?: number) => scenarios.placeOrder(session, quantity));

Cypress.Commands.add('advanceOrder', (sale: Sale, operator: AuthSession, steps?: AdvanceStep[]) =>
  scenarios.advanceOrder(sale, operator, steps),
);

Cypress.Commands.add('requestExchange', (session: AuthSession, sale: Sale, quantity?: number) =>
  scenarios.requestExchange(session, sale, quantity),
);

Cypress.Commands.add('exchangeToCoupon', (session: AuthSession, operator: AuthSession) => scenarios.exchangeToCoupon(session, operator));

Cypress.Commands.add('visitAs', (path: string, session: AuthSession) =>
  cy.visit(path, {
    onBeforeLoad(win) {
      win.sessionStorage.clear();
      win.localStorage.clear();
      win.sessionStorage.setItem('libra.authentication', JSON.stringify(session));
      win.sessionStorage.setItem(`libra.authentication.${session.type}`, JSON.stringify(session));
      win.document.cookie = `libra.authentication=${encodeURIComponent(JSON.stringify(session))}; path=/; SameSite=Strict`;
    },
  }),
);

Cypress.Commands.add('field', (name: string, value: string | number) =>
  cy.get(`input[name="${name}"], textarea[name="${name}"]`).clear().type(String(value), { delay: 0 }),
);

Cypress.Commands.add('fillAddress', (prefix = '', overrides: Partial<Address> = {}) => {
  const data = address('Delivery', 'Nova entrega Cypress');
  Object.entries({ ...data, ...overrides }).forEach(([key, value]) => {
    if (['type', 'residenceType', 'streetType'].includes(key)) return;
    cy.field(`${prefix}${key}`, value as string);
  });
  cy.get(`[name="${prefix}residenceType"]`).select('Casa');
  cy.get(`[name="${prefix}streetType"]`).select('Rua');
});

Cypress.Commands.add('fillCard', (overrides: Partial<Card> = {}) => {
  const data = card(overrides);
  (['number', 'printedName', 'securityCode'] as const).forEach((key) => cy.field(key, data[key]));
  cy.get('[name="brand"]').select(data.brand);
});

declare global {
  namespace Cypress {
    interface Chainable {
      api<T = any>(
        method: 'GET' | 'POST' | 'PUT' | 'DELETE',
        path: string,
        body?: any,
        session?: AuthSession,
      ): Chainable<Cypress.Response<T>>;
      newCustomer(overrides?: ProfileOverrides): Chainable<AuthSession>;
      admin(): Chainable<AuthSession>;
      prepareCart(session: AuthSession, quantity?: number): Chainable<PreparedCart>;
      placeOrder(session: AuthSession, quantity?: number): Chainable<Sale>;
      advanceOrder(sale: Sale, operator: AuthSession, steps?: AdvanceStep[]): Chainable<void>;
      requestExchange(session: AuthSession, sale: Sale, quantity?: number): Chainable<Exchange>;
      exchangeToCoupon(session: AuthSession, operator: AuthSession): Chainable<Coupon>;
      visitAs(path: string, session: AuthSession): Chainable<Cypress.AUTWindow>;
      field(name: string, value: string | number): Chainable<JQuery<HTMLElement>>;
      fillAddress(prefix?: string, overrides?: Partial<Address>): Chainable<void>;
      fillCard(overrides?: Partial<Card>): Chainable<void>;
    }
  }
}

export {};
