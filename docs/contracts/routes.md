## Cliente

| Funcionalidade apresentada | DRS relacionado | Implementação no protótipo | Comportamento demonstrável |
|---|---|---|---|
| Cadastrar cliente | RF0021, RN0021, RN0022, RN0023 e RN0026 | `/sign-up` e `/customer/complete-profile` | Cria o acesso, completa os dados pessoais e cadastra endereço residencial, de cobrança e entrega. |
| Consultar cliente | RF0024 | `/customer/account` | Apresenta dados pessoais, código, telefone, endereços e cartões do cliente. |
| Alterar cliente | RF0022 | `/customer/account` | Altera nome, e-mail, nascimento e telefone, atualizando imediatamente a página. |
| Alterar senha | RF0028, RNF0031 e RNF0032 | `/customer/account` | Possui formulário separado com senha atual, nova senha e confirmação. |
| Inativar cliente | RF0023 | `/customer/account` | Solicita confirmação, inativa o perfil local e retorna à entrada do sistema. |
| Adicionar item ao carrinho | RF0031, RF0032 e RN0031 | `/customer/products/[id]` | Permite escolher a quantidade e incluir o livro disponível no carrinho. |
| Consultar carrinho | RF0031 | `/customer/cart` | Exibe produtos, quantidades, valores, subtotal, frete estimado e reserva. |
| Alterar quantidade do carrinho | RF0031 e RF0032 | `/customer/cart` | A alteração recalcula dinamicamente o total do item e o subtotal. |
| Excluir item do carrinho | RF0031 | `/customer/cart` | Remove o item e recalcula os valores imediatamente. |
| Realizar e finalizar pedido | RF0033 e RF0037 | `/customer/checkout` | Valida endereço e pagamentos, cria um pedido local e limpa o carrinho. |
| Selecionar cupom promocional | RF0036 e RN0033 | `/customer/checkout` | Aplica um cupom promocional por compra; selecionar outro substitui o anterior. |
| Selecionar cupons de troca | RF0036, RN0035 e RN0036 | `/customer/checkout` | Permite combinar vários créditos de troca e atualiza o desconto e o saldo. |
| Selecionar um cartão | RF0036 e RN0037 | `/customer/checkout` | Seleciona cartão cadastrado e atribui automaticamente todo o saldo restante. |
| Selecionar vários cartões | RN0034 e RN0035 | `/customer/checkout` | Permite distribuir o total entre cartões, valida a soma e o mínimo de R$ 10,00 por cartão. Um único residual inferior a R$ 10,00 é aceito quando houver cupom. |
| Combinar cartões e cupons | RF0036, RN0034 e RN0035 | `/customer/checkout` | Cupons reduzem o saldo e o restante pode ser dividido entre um ou mais cartões. |
| Adicionar cartão durante a compra | RF0036, RN0024 e RN0025 | `/customer/checkout` | Cadastra número, nome impresso, bandeira e CVV e disponibiliza o cartão no checkout. |
| Selecionar endereço cadastrado | RF0035 | `/customer/checkout` | Lista os endereços de entrega do perfil e permite selecionar um deles. |
| Inserir novo endereço | RF0026, RF0034 e RF0035 | `/customer/checkout` | Cadastra identificação, CEP, logradouro, número, bairro, cidade e estado e atualiza as opções. |
| Consultar pedido | RF0025 | `/customer/orders` | Exibe código, data, total, status e itens de todos os pedidos do cliente. |
| Confirmar recebimento | Extensão definida para a apresentação | `/customer/orders` | Em pedido `EM TRÂNSITO`, altera dinamicamente o status para `ENTREGUE`. |
| Cancelar pedido | Extensão definida para a apresentação | `/customer/orders` | Disponível nos estados `EM ABERTO` e `EM PROCESSAMENTO`; altera para `CANCELADO`. |
| Solicitar troca de um item | RF0040, RN0041 e Rn0043 | `/customer/orders` | Em pedido entregue, abre a seleção de itens e gera solicitação de troca. |
| Informar despacho do item de troca | Extensão do fluxo de troca da apresentação | `/customer/orders` | Após solicitação ou aceite, altera o estado para `ITEM ENVIADO`. |
| Consultar cupons | RF0036, RF0044 e modelo unificado de cupons | `/customer/coupons` | Lista código, tipo, valor, descrição e situação dos cupons disponíveis. |
| Interagir com chatbot de recomendação | RNF0044 | Componente disponível nas páginas `/customer/*` | Mantém histórico recente, responde perguntas e apresenta links para produtos relacionados. |

## Administrador

| Funcionalidade apresentada | DRS relacionado | Implementação no protótipo | Comportamento demonstrável |
|---|---|---|---|
| Cadastrar cliente | RF0021 e RN0021–RN0026 | `/admin/customers/new` | Cadastra dados pessoais, contato, senha forte e endereço residencial usado para cobrança e entrega. O cliente aparece na listagem local. |
| Consultar clientes | RF0024 | `/admin/customers` | Busca dinamicamente por nome, e-mail, CPF ou código. |
| Consultar perfil do cliente | RF0024 e RF0025 | `/admin/customers/[id]/profile` | Exibe dados cadastrais, situação, endereços, cartões e transações. |
| Alterar cliente | RF0022 e RF0034 | `/admin/customers/[id]/profile` | Permite editar dados básicos e endereços do cliente. |
| Consultar pedidos | Requisitos de vendas e RF0042 para trocas | `/admin/sales` | Exibe código, cliente, itens, data, valor e situação dos pedidos e trocas. |
| `EM ABERTO` → `EM PROCESSAMENTO` | Fluxo de aprovação adaptado para a apresentação | `/admin/sales` | O botão correspondente aparece somente no estado de origem e atualiza o cartão do pedido. |
| `EM PROCESSAMENTO` → `PAGAMENTO REALIZADO` | RF0037, RN0037 e RN0038, com nomenclatura adaptada | `/admin/sales` | Atualiza dinamicamente o status após a demonstração de processamento. |
| `PAGAMENTO REALIZADO` → `EM TRÂNSITO` | RF0038 e RN0039, com nomenclatura adaptada | `/admin/sales` | Libera a transição de expedição e atualiza o status. |
| `EM TRÂNSITO` → `ENTREGUE` | RF0039 e RN0040 | `/admin/sales` | Confirma a entrega e encerra o fluxo principal do pedido. |
| `TROCA SOLICITADA` → `TROCA ACEITA` | RF0041 e RN0041, com nomenclatura adaptada | Aba **Trocas** em `/admin/sales` | Aceita a solicitação e atualiza imediatamente o estado da troca. |
| `TROCA SOLICITADA` → `TROCA NEGADA` | Decisão complementar da apresentação | Aba **Trocas** em `/admin/sales` | Nega a solicitação e atualiza imediatamente o estado da troca. |
| `ITEM ENVIADO` → `ITEM RECEBIDO` | RF0043, com etapa intermediária detalhada para a apresentação | Aba **Trocas** em `/admin/sales` | Registra visualmente o recebimento do item enviado pelo cliente. |
| `ITEM RECEBIDO` → `TROCA PROCESSADA` | RF0043, RF0044 e RN0042, com nomenclatura adaptada | Aba **Trocas** em `/admin/sales` | Finaliza o processamento administrativo da troca. |
| Analisar histórico de vendas | RF0055 | `/admin/analysis` | Filtra dados fictícios por data inicial, data final e agrupamento por produto ou categoria. |
| Exibir gráfico de linhas | RNF0043 | `/admin/analysis` | Renderiza linhas, pontos, valores, datas e legenda para cada série selecionada. |

## Documentos do DRS considerados

- `docs/drs/cadastro-de-clientes.md`
- `docs/drs/vendas-eletronicas.md`
- `docs/drs/analise.md`
- `docs/drs/recomendacao-personalizada.md`
- `docs/drs/analysis/modelo-cupons.md`
- `docs/drs/analysis/modelo-pagamento.md`
- `docs/drs/analysis/modelo-assistente-ia.md`

