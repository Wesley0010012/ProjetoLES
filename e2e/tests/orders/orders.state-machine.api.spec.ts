import { expectRejected } from '../../support/assertions';
import type { AdvanceStep, SaleStatus, AuthSession } from '../../support/types';

const saleStates: Array<[SaleStatus, AdvanceStep[], AdvanceStep | null]> = [
  ['EM_ABERTO', [], 'process'],
  ['EM_PROCESSAMENTO', ['process'], 'payment'],
  ['PAGAMENTO_REALIZADO', ['process', 'payment'], 'dispatch'],
  ['EM_TRANSITO', ['process', 'payment', 'dispatch'], 'deliver'],
  ['ENTREGUE', ['process', 'payment', 'dispatch', 'deliver'], null],
  ['CANCELADA', [], null],
];

describe('Orders API — máquina de estados', () => {
  let user: AuthSession, operator: AuthSession;
  beforeEach(() => {
    cy.newCustomer().then((value) => (user = value));
    cy.admin().then((value) => (operator = value));
  });

  saleStates.forEach(([state, steps, valid]) => {
    (['process', 'payment', 'dispatch', 'deliver'] as AdvanceStep[]).filter((action) => action !== valid).forEach((action) => {
      it(`rejeita a transição "${action}" em ${state} e preserva o pedido`, () => {
        cy.placeOrder(user).then((sale) => {
          cy.advanceOrder(sale, operator, steps);
          if (state === 'CANCELADA') cy.api('POST', `/customer/orders/${sale.id}/cancel`, {}, user).its('status').should('eq', 204);
          cy.api('POST', `/admin/sales/${sale.id}/${action}`, {}, operator).then((r) => expectRejected(r));
          cy.api('GET', '/customer/orders', undefined, user).then((r) => expect(r.body.find((o: any) => o.id === sale.id).status).eq(state));
        });
      });
    });

    if (state !== 'EM_TRANSITO') {
      it(`cliente não confirma recebimento em ${state}`, () => {
        cy.placeOrder(user).then((sale) => {
          cy.advanceOrder(sale, operator, steps);
          if (state === 'CANCELADA') cy.api('POST', `/customer/orders/${sale.id}/cancel`, {}, user);
          cy.api('POST', `/customer/orders/${sale.id}/receipt`, {}, user).then((r) => expectRejected(r));
        });
      });
    }

    if ((['EM_TRANSITO', 'ENTREGUE', 'CANCELADA'] as SaleStatus[]).includes(state)) {
      it(`cliente não cancela pedido em ${state}`, () => {
        cy.placeOrder(user).then((sale) => {
          cy.advanceOrder(sale, operator, steps);
          if (state === 'CANCELADA') cy.api('POST', `/customer/orders/${sale.id}/cancel`, {}, user);
          cy.api('POST', `/customer/orders/${sale.id}/cancel`, {}, user).then((r) => expectRejected(r));
        });
      });
    }
  });

  (['process', 'payment', 'dispatch', 'deliver'] as AdvanceStep[]).forEach((action) => {
    it(`rejeita "${action}" sem papel de operador`, () => {
      cy.api('POST', `/admin/sales/999999/${action}`, {}, user).then((r) => expectRejected(r, 403));
    });

    it(`rejeita "${action}" em pedido inexistente`, () => {
      cy.api('POST', `/admin/sales/999999/${action}`, {}, operator).then((r) => expectRejected(r, 404));
    });
  });

  (['receipt', 'cancel'] as const).forEach((action) => {
    it(`impede ${action} em pedido de outro cliente`, () => {
      cy.placeOrder(user).then((sale) => {
        cy.newCustomer().then((other) => cy.api('POST', `/customer/orders/${sale.id}/${action}`, {}, other).then((r) => expectRejected(r, 404)));
      });
    });

    it(`impede ${action} em pedido inexistente`, () => {
      cy.api('POST', `/customer/orders/999999/${action}`, {}, user).then((r) => expectRejected(r, 404));
    });
  });
});
