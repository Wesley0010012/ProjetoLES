# PostgreSQL local

Inicie a base local a partir da raiz do repositório:

```bash
docker compose up -d postgres
```

Copie `.env.example` para `.env` e mantenha os valores `DB_*` ou informe
`DATABASE_URL`. A API cria a tabela `domain_entities` quando
`DB_SYNCHRONIZE=true` (padrão fora de produção).

As entidades de domínio permanecem livres de decorators do TypeORM. Os
repositórios PostgreSQL serializam o estado tipado em `jsonb`, preservando
entidades, value objects, relações e datas para os casos de uso.

## Dados de pedidos para o relatório

O módulo de vendas gera automaticamente **20.000 pedidos entregues**, além dos
quatro pedidos operacionais e da troca já existentes. O histórico cobre os dois
anos anteriores à inicialização, até o momento atual, com todos os livros do
catálogo, clientes, preços e quantidades variados e maior volume nos meses recentes.
Os pedidos entregues alimentam os agrupamentos por produto e categoria.

Para aumentar o volume, inicie o backend com a variável de ambiente:

```bash
SALES_SEED_COUNT=100000 npm run start:dev
```

O limite é 100.000 pedidos adicionais; `SALES_SEED_COUNT=0` mantém apenas os quatro
originais. O padrão é 20.000 para limitar o custo das listagens sem paginação.
Neste momento, **pedidos permanecem em memória**, mesmo com PostgreSQL configurado:
o histórico é recriado a cada inicialização e não é inserido no banco. São dados
demonstrativos; sua geração não movimenta o estoque nem processa pagamentos.

### Trocas demonstrativas

O seed inclui **1.000 trocas adicionais** (ou a quantidade de pedidos sintéticos,
se menor), além da troca original. Use `EXCHANGES_SEED_COUNT` entre 0 e 100000
para configurar o volume. Inclui solicitações, autorizações, devoluções, itens
recebidos, recusas e trocas concluídas. As concluídas possuem cupons disponíveis
para o cliente. Os pedidos vinculados recebem o estado correspondente, portanto
os que estão em troca deixam de integrar o relatório até sua conclusão.

```bash
SALES_SEED_COUNT=20000 EXCHANGES_SEED_COUNT=3000 npm run start:dev
```

As trocas e os cupons demonstrativos também são recriados em memória ao iniciar.
