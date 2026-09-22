import { expectRejected } from '../../support/assertions';
import type { AuthSession } from '../../support/types';

describe('Admin — análise de vendas (interface)', () => {
  let operator: AuthSession;
  beforeEach(() => cy.admin().then((value) => (operator = value)));

  it('mostra indicadores consistentes com a API', () => {
    cy.intercept('GET', '/api/admin/sales/analysis?*').as('analysis');
    cy.visitAs('/admin/analysis', operator);
    cy.wait('@analysis').then(({ response }) => {
      expect(response!.statusCode).eq(200);
      const quantity = response!.body.flatMap((s: any) => s.points).reduce((sum: number, p: any) => sum + p.quantity, 0);
      cy.get('[aria-label="Indicadores da seleção"]').should('contain', quantity.toLocaleString('pt-BR'));
    });
    cy.get('svg[aria-label^="Evolução das unidades vendidas"]').should('be.visible');
  });

  it('alterna o agrupamento para categorias', () => {
    cy.intercept('GET', '/api/admin/sales/analysis?*').as('analysis');
    cy.visitAs('/admin/analysis', operator);
    cy.wait('@analysis');
    cy.contains('button', 'Categorias').click();
    cy.wait('@analysis').its('request.url').should('include', 'groupBy=CATEGORY');
  });

  it('alterna entre tipos de gráfico e seleção de itens', () => {
    cy.visitAs('/admin/analysis', operator);
    cy.contains('button', 'Linhas diárias').click().should('have.attr', 'aria-pressed', 'true');
    cy.contains('button', 'Comparar top 5').click().should('have.attr', 'aria-pressed', 'true');
    cy.contains('button', 'Comparar seleção').click();
    cy.contains('summary', 'Personalizar seleção').click();
    cy.contains('button', 'Limpar').click();
    cy.contains('Selecione pelo menos um item').should('be.visible');
    cy.contains('button', 'Selecionar todos').click();
    cy.get('svg[aria-label^="Evolução do lucro"]').should('be.visible');
  });

  it('não encontra itens ao buscar uma categoria inexistente na seleção', () => {
    cy.visitAs('/admin/analysis', operator);
    cy.contains('summary', 'Personalizar seleção').click();
    cy.get('[aria-label="Buscar na seleção"]').type('categoria-inexistente');
    cy.get('details input[type="checkbox"]').should('not.exist');
  });

  it('valida período com data inicial posterior à final', () => {
    cy.visitAs('/admin/analysis', operator);
    cy.get('input[type="date"]').first().clear().type('2099-01-01');
    cy.contains(/Data inicial|data inicial/).should('exist');
    cy.get('svg[aria-label^="Evolução do lucro"]').should('not.exist');
  });

  it('mostra período sem vendas', () => {
    cy.visitAs('/admin/analysis', operator);
    cy.get('input[type="date"]').last().clear().type('2099-12-31');
    cy.get('input[type="date"]').first().clear().type('2099-01-01');
    cy.contains('Nenhuma venda encontrada.').should('be.visible');
  });

  it('recupera o gráfico após falha da API', () => {
    cy.intercept({ method: 'GET', url: '/api/admin/sales/analysis?*', times: 1 }, { statusCode: 500, body: { message: 'Erro de análise' } });
    cy.visitAs('/admin/analysis', operator);
    cy.contains('[role="alert"]', 'Não foi possível carregar a análise').should('be.visible');
    cy.contains('button', 'Tentar novamente').click();
    cy.get('svg[aria-label^="Evolução do lucro"]').should('be.visible');
    cy.get('[role="alert"]').should('not.exist');
  });
});

describe('Admin API — validação do filtro de análise', () => {
  let operator: AuthSession;
  beforeEach(() => cy.admin().then((value) => (operator = value)));

  ([
    'startDate=2026-02-01&endDate=2026-01-01&groupBy=PRODUCT',
    'startDate=invalid&endDate=2026-01-01&groupBy=PRODUCT',
    'startDate=2026-01-01&endDate=invalid&groupBy=PRODUCT',
    'startDate=2026-01-01&endDate=2026-02-01&groupBy=INVALID',
    'endDate=2026-01-01&groupBy=PRODUCT',
    'startDate=2026-01-01&groupBy=PRODUCT',
    'startDate=2026-01-01&endDate=2026-02-01',
  ] as const).forEach((query, index) => {
    it(`rejeita filtro de análise inválido (caso ${index + 1})`, () => {
      cy.api('GET', `/admin/sales/analysis?${query}`, undefined, operator).then((r) => expectRejected(r));
    });
  });
});
