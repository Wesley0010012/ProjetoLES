# Testes E2E — Libra

A suíte usa Cypress com TypeScript e navegador real, Nginx, frontend Next.js,
backend NestJS e PostgreSQL. Os fluxos principais usam requisições reais. A
preparação cria clientes exclusivos pela API; nenhuma rota de reset foi
adicionada à aplicação.

## Arquitetura

O código é dividido em duas camadas para manter a suíte desacoplada da
ferramenta de teste:

- **`support/`** — infraestrutura reutilizável.
  - `types.ts`: tipos de domínio (sessão, endereço, cartão, venda, troca,
    cupom...). Sem dependência de nenhuma ferramenta.
  - `fixtures.ts`: construtores puros de massa de dados (`identity`,
    `address`, `card`, `profile`). Sem dependência do Cypress — podem ser
    testados ou reaproveitados isoladamente.
  - `api-client.ts`: **única** camada acoplada ao Cypress para chamadas HTTP
    (`cy.request` por trás de uma classe `ApiClient`). Se o runner mudar, só
    este arquivo precisa ser reescrito.
  - `scenarios.ts`: cenários de negócio (`newCustomer`, `admin`, `placeOrder`,
    `advanceOrder`, `requestExchange`, `exchangeToCoupon`...) construídos
    apenas sobre `api-client.ts` e `fixtures.ts`.
  - `commands.ts`: registra os comandos custom do Cypress (`cy.api`,
    `cy.newCustomer`, `cy.visitAs`, `cy.fillAddress`...) como fachada sobre
    `scenarios.ts`, com tipagem completa do namespace `Cypress.Chainable`.
  - `assertions.ts`: asserções compartilhadas pelos specs de validação de API.
- **`tests/`** — specs, um diretório por módulo de negócio.

## Módulos

| Diretório | Cobertura |
| --- | --- |
| `tests/auth` | Cadastro pela interface e pela API, autenticação e autorização |
| `tests/customers` | Dados pessoais, perfil incompleto, inativação de conta |
| `tests/addresses` | CRUD de endereços, proteção do principal/último endereço |
| `tests/cards` | CRUD de cartões, validações de bandeira/Luhn/CVV |
| `tests/cart` | Adicionar/alterar/remover item, validações de quantidade e estoque |
| `tests/checkout` | Finalização de compra, validações de pagamento/cupom, limites de valor |
| `tests/orders` | Transições administrativas, cancelamento, confirmação de recebimento, máquina de estados |
| `tests/exchanges` | Solicitação, aceite/recusa, despacho, recebimento e geração de cupom, máquina de estados |
| `tests/coupons` | Consulta de cupons, reuso e consumo único |
| `tests/assistant` | Chatbot de recomendação, falhas do provedor de IA |
| `tests/admin` | Busca/inativação de clientes, paginação, análise de vendas |

Cada módulo mistura, quando aplicável, um spec de **interface** (`*.ui.spec.ts`)
e um spec de **API** (`*.api.spec.ts`), este último cobrindo entradas que o
HTML do formulário já bloqueia — enviadas direto à API real via `cy.request`.
Os casos de erro são, na medida do possível, um teste por causa (`it('rejeita
CPF inválido', ...)`, `it('rejeita CPF duplicado', ...)`), em vez de um único
teste cobrindo várias condições — isso deixa claro qual regra especificamente
quebrou quando um teste falha.

## Executar tudo

Na raiz do repositório, com Docker e Compose 2.24.4 ou superior:

```bash
bash e2e/scripts/run-docker.sh
```

O script cria a stack **libra-e2e**, recompila as aplicações, aguarda os
healthchecks, executa a suíte e remove **somente o volume e os containers de
teste** ao terminar, inclusive em falhas. A stack de demonstração não é removida.
As portas locais 8088 e 8089 precisam estar livres. A primeira execução baixa
a imagem `cypress/included:16.1.0`, que inclui o navegador.

Executar um módulo específico:

```bash
bash e2e/scripts/run-docker.sh --spec "tests/checkout/**/*.spec.ts"
```

Os testes são sequenciais e isolam sessão, cookies e storage entre casos.
Cada cliente usa e-mail e CPF sintéticos exclusivos. Os testes liberam reservas
restantes ao finalizar. Não execute duas instâncias contra a mesma stack.

## Evidências

Após a execução:

- `results/index.html`: relatório legível com resultado de cada cenário.
- `results/summary.json`: contagem e detalhes para automação.
- `results/junit-*.xml`: resultados JUnit por arquivo.
- `cypress/videos/`: gravação de cada arquivo executado.
- `cypress/screenshots/`: captura automática das falhas.

Os artefatos são ignorados pelo Git. A workflow
[../.github/workflows/e2e.yml](../.github/workflows/e2e.yml) executa a suíte em
pull requests, em pushes para `main`/`master` e manualmente, preservando evidências.
Não há retries automáticos nem supressão global de erros JavaScript.

### Dependências externas e limites

O Gemini é substituído **apenas na stack de teste** por `gemini-mock.cjs`.
O browser continua chamando a API real, que consulta o catálogo, persiste o
histórico e chama esse servidor pelo protocolo do provedor. Isso permite testar
falhas e recuperação sem chave real, custo ou respostas aleatórias. A qualidade
de recomendações do Gemini real não é avaliada por esta suíte.

`cy.intercept` injeta falhas de rede/HTTP em cenários explicitamente identificados.
Os fluxos comerciais felizes não substituem as respostas da aplicação. Pagamentos
usam o adaptador de demonstração já existente: `4000000000000002` reprova;
os demais números válidos são aprovados. Não há integração bancária real.

Mapeamento dos nomes de status do protótipo:

| Requisito | Código da API |
| --- | --- |
| Em trânsito | `EM_TRANSITO` |
| Troca solicitada | `EM_TROCA` |
| Troca aceita / negada | `TROCA_AUTORIZADA` / `TROCA_RECUSADA` |
| Item enviado / recebido | `EM_DEVOLUCAO` / `ITEM_RECEBIDO` |
| Troca processada | `TROCADO` |

O período inicial do gráfico é o período de demonstração configurado na tela.
A stack reduz o seed para 30 pedidos e nenhuma troca sintética adicional;
cada troca necessária ao teste é produzida pelo fluxo real.

## Abrir Cypress localmente

Requer Node 22, 24 ou 26+ e as dependências de sistema do Cypress.

```bash
# Na raiz, sobe apenas a stack de teste:
docker compose --env-file /dev/null -p libra-e2e \
  -f docker-compose.yml -f e2e/compose.yml up -d --build --wait nginx

cd e2e
npm ci
npm run typecheck   # valida os tipos sem abrir o Cypress
npm run open
```

A configuração local usa `http://localhost:8088` e o simulador em `:8089`.
Finalize a stack após a investigação, a partir da raiz:

```bash
docker compose --env-file /dev/null -p libra-e2e \
  -f docker-compose.yml -f e2e/compose.yml down -v
```

Referências de configuração e execução:
[documentação oficial do Cypress](https://docs.cypress.io/app/references/configuration),
[integração contínua](https://docs.cypress.io/app/continuous-integration/overview).
