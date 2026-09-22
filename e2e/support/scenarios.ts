// Cenários de negócio reutilizáveis pelos specs. Constroem-se apenas sobre
// ApiClient (support/api-client.ts) e sobre as fixtures puras
// (support/fixtures.ts) — não usam cy.request diretamente, então continuam
// válidos mesmo se a camada de transporte HTTP for trocada.

import { api } from './api-client';
import { address, card, identity, profile, PASSWORD } from './fixtures';
import type {
  AdvanceStep,
  Coupon,
  Exchange,
  PreparedCart,
  ProfileOverrides,
  Sale,
  AuthSession,
} from './types';

export function newCustomer(overrides: ProfileOverrides = {}): Cypress.Chainable<AuthSession> {
  const data = identity();
  return api
    .post('/auth/sign-up', { email: data.email, password: PASSWORD, passwordConfirmation: PASSWORD })
    .then((signUpResponse) => {
      expect(signUpResponse.status).eq(201);
      const session: AuthSession = {
        ...(signUpResponse.body as Omit<AuthSession, 'email' | 'document' | 'type'>),
        type: 'USER',
        email: data.email,
        document: data.document,
      };
      return api.post(`/users/${session.userId}/customer`, profile(data.document, overrides), session).then((createResponse) => {
        expect(createResponse.status, JSON.stringify(createResponse.body)).eq(201);
        return api.get(`/users/${session.userId}/customer`, session).then((getResponse) => {
          expect(getResponse.status).eq(200);
          session.profile = getResponse.body as AuthSession['profile'];
          registerCustomerForCleanup(session);
          return session;
        });
      });
    });
}

export function admin(): Cypress.Chainable<AuthSession> {
  return api.post('/auth/demo-session', { type: 'OPERATOR' }).then((response) => {
    expect(response.status).eq(201);
    const session: AuthSession = { ...(response.body as Omit<AuthSession, 'type'>), type: 'OPERATOR' };
    return session;
  });
}

export function prepareCart(session: AuthSession, quantity = 1): Cypress.Chainable<PreparedCart> {
  return api.get<any[]>('/books').then((response) => {
    const product = response.body
      .filter((book) => book.available && book.availableQuantity >= quantity)
      .sort((a, b) => b.availableQuantity - a.availableQuantity)[0];
    expect(product, 'produto disponível para teste').to.exist;
    return api.post('/customer/cart/items', { bookId: product.id, quantity }, session).then((cartResponse) => {
      expect(cartResponse.status, JSON.stringify(cartResponse.body)).eq(201);
      return { ...(cartResponse.body as PreparedCart), product };
    });
  });
}

export function placeOrder(session: AuthSession, quantity = 1): Cypress.Chainable<Sale> {
  return prepareCart(session, quantity).then((cart) => {
    const payload = {
      addressId: session.profile!.addresses.find((a) => a.type === 'Delivery')!.id,
      cardPayments: [
        {
          cardId: session.profile!.cards[0].id,
          amount: Math.round((cart.subtotal + cart.estimatedFreight) * 100) / 100,
        },
      ],
      couponCodes: [] as string[],
    };
    return api.post('/customer/checkout', payload, session).then((response) => {
      expect(response.status, JSON.stringify(response.body)).eq(201);
      return { ...(response.body as Sale), product: cart.product };
    });
  });
}

export function advanceOrder(
  sale: Sale,
  operator: AuthSession,
  steps: AdvanceStep[] = ['process', 'payment', 'dispatch', 'deliver'],
): void {
  steps.forEach((step) => {
    api.post(`/admin/sales/${sale.id}/${step}`, {}, operator).its('status').should('eq', 204);
  });
}

export function requestExchange(session: AuthSession, sale: Sale, quantity = 1): Cypress.Chainable<Exchange> {
  return api
    .post(
      '/customer/exchanges',
      {
        saleId: sale.id,
        items: [{ bookId: sale.product.id, quantity }],
        reason: 'Livro danificado durante o transporte',
      },
      session,
    )
    .then((response) => {
      expect(response.status).eq(201);
      return response.body as Exchange;
    });
}

export function exchangeToCoupon(session: AuthSession, operator: AuthSession): Cypress.Chainable<Coupon> {
  return placeOrder(session).then((sale) => {
    advanceOrder(sale, operator);
    return requestExchange(session, sale).then((exchange) => {
      api
        .post(`/admin/sales/exchanges/${exchange.id}/authorize`, { observation: 'Troca aprovada pelo teste' }, operator)
        .its('status')
        .should('eq', 204);
      api.post(`/customer/exchanges/${sale.id}/dispatch`, {}, session).its('status').should('eq', 204);
      api.post(`/admin/sales/exchanges/${exchange.id}/arrival`, {}, operator).its('status').should('eq', 204);
      return api
        .post(
          `/admin/sales/exchanges/${exchange.id}/receive`,
          { returnToStock: true, receivedAt: new Date().toISOString() },
          operator,
        )
        .then((response) => {
          expect(response.status).eq(201);
          return response.body as Coupon;
        });
    });
  });
}

// Clientes criados durante um teste têm o carrinho esvaziado em afterEach
// (ver support/e2e.ts), sem apagar dados de outros testes em execução.
let createdCustomers: AuthSession[] = [];

function registerCustomerForCleanup(session: AuthSession): void {
  createdCustomers.push(session);
}

export function drainCreatedCustomersCarts(): void {
  const customers = createdCustomers;
  createdCustomers = [];
  customers.forEach((session) => {
    api.get<{ items: { bookId: number }[] }>('/customer/cart', session).then(({ status, body }) => {
      if (status === 200) {
        body.items.forEach((item) => api.delete(`/customer/cart/items/${item.bookId}`, session));
      }
    });
  });
}

export { address, card, identity, profile, PASSWORD };
