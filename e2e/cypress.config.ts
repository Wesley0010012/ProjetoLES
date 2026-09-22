import { defineConfig } from 'cypress';
import fs from 'node:fs';

interface SpecSummaryTest {
  title: string;
  state: string;
  error: string;
}

interface SpecSummary {
  spec: string;
  tests: SpecSummaryTest[];
}

function escapeHtml(value: unknown): string {
  return String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}

export default defineConfig({
  viewportWidth: 1440,
  viewportHeight: 1000,
  defaultCommandTimeout: 10000,
  requestTimeout: 10000,
  responseTimeout: 30000,
  video: true,
  screenshotOnRunFailure: true,
  retries: 0,
  reporter: 'junit',
  reporterOptions: { mochaFile: 'results/junit-[hash].xml', toConsole: false },
  e2e: {
    baseUrl: 'http://localhost:8088',
    specPattern: 'tests/**/*.spec.ts',
    supportFile: 'support/e2e.ts',
    setupNodeEvents(on) {
      on('after:run', (results: any) => {
        fs.mkdirSync('results', { recursive: true });
        const specs: SpecSummary[] = (results.runs || []).map((run: any) => ({
          spec: run.spec.relative,
          tests: run.tests.map((test: any) => ({
            title: test.title.join(' > '),
            state: test.state,
            error: test.displayError || '',
          })),
        }));
        const summary = {
          startedAt: results.startedTestsAt,
          endedAt: results.endedTestsAt,
          total: results.totalTests,
          passed: results.totalPassed,
          failed: results.totalFailed,
          pending: results.totalPending,
          skipped: results.totalSkipped,
          specs,
        };
        fs.writeFileSync('results/summary.json', JSON.stringify(summary, null, 2));
        const rows = specs
          .flatMap((spec) =>
            spec.tests.map(
              (test) =>
                `<tr><td>${escapeHtml(spec.spec)}</td><td>${escapeHtml(test.title)}</td><td>${escapeHtml(test.state)}</td><td><pre>${escapeHtml(test.error)}</pre></td></tr>`,
            ),
          )
          .join('');
        fs.writeFileSync(
          'results/index.html',
          `<!doctype html><html lang="pt-BR"><meta charset="utf-8"><title>Libra — Cypress E2E</title><style>body{font:14px system-ui;margin:32px}table{border-collapse:collapse;width:100%}td,th{border:1px solid #ddd;padding:8px;text-align:left}pre{white-space:pre-wrap;max-width:50vw}th{background:#eee}</style><h1>Libra — Cypress E2E</h1><p>${escapeHtml(summary.endedAt)} — ${summary.passed}/${summary.total} aprovados; ${summary.failed} falhas; ${summary.pending} pendentes; ${summary.skipped} ignorados.</p><table><thead><tr><th>Arquivo</th><th>Cenário</th><th>Resultado</th><th>Erro</th></tr></thead><tbody>${rows}</tbody></table></html>`,
        );
      });
      on('task', {
        async provider(mode: string) {
          const response = await fetch(`${process.env.GEMINI_MOCK_URL || 'http://localhost:8089'}/control`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mode }),
          });
          if (!response.ok) throw new Error('Não foi possível configurar o provedor de teste');
          return response.json();
        },
        async providerRequests() {
          return (await fetch(`${process.env.GEMINI_MOCK_URL || 'http://localhost:8089'}/requests`)).json();
        },
      });
    },
  },
});
