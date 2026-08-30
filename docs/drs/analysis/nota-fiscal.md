# Análise de requisitos de nota fiscal

## Resultado

Não existe requisito explícito relacionado à emissão ou ao gerenciamento de
notas fiscais na documentação atual do projeto.

A verificação considerou os documentos Markdown presentes em `docs/`, além do
documento de requisitos original:
`docs/source/DRS_LES_1_2026 (3).pdf`.

Não foram encontradas definições para:

- emissão de nota fiscal ou NF-e;
- geração de documento fiscal após uma venda;
- armazenamento de número, série ou chave de acesso;
- consulta ou download de nota fiscal;
- envio da nota fiscal ao cliente;
- cancelamento, correção ou reemissão;
- integração com sistema fiscal, prefeitura ou SEFAZ;
- faturamento ou cadastro de dados fiscais.

## Requisitos relacionados

O DRS possui requisitos sobre realização e finalização de compras, validação
de pagamentos, alteração do status da venda, movimentação do estoque, entrega
e consulta de transações. Entretanto, nenhum deles determina que a aprovação,
o faturamento ou a entrega de uma compra gere uma nota fiscal.

## Conclusão

A nota fiscal constitui uma lacuna do DRS atual. Caso esse comportamento faça
parte do escopo do sistema, deverão ser criados requisitos adicionais antes da
implementação, definindo ao menos:

- o momento em que a nota fiscal deve ser emitida;
- quais vendas ou operações exigem emissão;
- os dados fiscais obrigatórios do cliente e da empresa;
- o responsável e o serviço utilizado para emissão;
- o comportamento em casos de rejeição ou indisponibilidade;
- as regras de consulta, envio, cancelamento e armazenamento.
