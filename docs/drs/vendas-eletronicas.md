# Módulo Gerenciar Vendas Eletrônicas

> Fonte: `docs/source/DRS_LES_1_2026 (3).pdf`.

## Requisitos funcionais

### RF0031 — Gerenciar carrinho de compra

O sistema deve permitir que produtos sejam colocados em um repositório temporário para futura compra (carrinho de compra). Deve ser possível adicionar, alterar e excluir itens de compra no carrinho. Também deve ser possível visualizar os itens no carrinho.

### RF0032 — Definir quantidade de itens para o carrinho

Deve ser possível editar a quantidade de cada item ao adicionar um produto no carrinho. Também deve ser possível editar a quantidade de itens de um carrinho na visualização dos itens já adicionados.

### RF0033 — Realizar compra

Deve ser possível realizar uma compra a partir de um carrinho de compra.

### RF0034 — Calcular frete

O sistema deve calcular o frete da compra com base nos itens selecionados e no endereço apontado pelo cliente.

### RF0035 — Selecionar endereço de entrega

O cliente pode selecionar qualquer endereço de entrega previamente cadastrado em seu perfil ou cadastrar um novo endereço de entrega. Caso um novo endereço seja inserido, deve-se dar a possibilidade de incorporá-lo ao perfil do cliente.

### RF0036 — Selecionar forma de pagamento

O cliente pode selecionar qualquer cartão de crédito previamente cadastrado em seu perfil ou cadastrar um novo cartão de crédito. Caso um novo cartão seja cadastrado, deve-se dar a possibilidade de incorporá-lo ao perfil do cliente.

O cliente também poderá utilizar um cupom de troca ou um cupom promocional válido.

Deve-se possibilitar que o pagamento seja feito utilizando cupons de troca, cupons promocionais e cartão de crédito.

### RF0037 — Finalizar compra

Uma compra deve ser finalizada após a seleção da forma de pagamento e do endereço de entrega. Após a finalização, o status da compra deve ser `EM PROCESSAMENTO`.

### RF0038 — Despachar produtos para entrega

O sistema deve possibilitar que um usuário com perfil de administrador selecione vendas já aprovadas para serem entregues. Assim, o status deve ficar `EM TRÂNSITO`.

### RF0039 — Produtos entregues

O sistema deve possibilitar que um usuário com perfil de administrador confirme a entrega de uma compra. Assim, o status deve ficar `ENTREGUE`.

### RF0040 — Solicitar troca

O sistema deve possibilitar que um item de uma compra seja trocado por um cliente através da visualização de seus pedidos.

### RF0041 — Autorizar trocas

O sistema deverá possibilitar que o administrador autorize pedidos ou compras com status `EM TROCA`. Assim, o pedido passa a ficar com status `TROCA AUTORIZADA`.

### RF0042 — Visualização de trocas

O sistema deverá possibilitar que o administrador visualize todos os pedidos de troca ou compras com status `EM TROCA`.

### RF0043 — Confirmar recebimento de itens para troca

O sistema deverá possibilitar que o administrador confirme o recebimento de pedidos de troca ou compras com status `EM TROCA`.

Nesta confirmação, o administrador deverá informar se os itens trocados deverão retornar ao estoque. Em caso positivo, deve-se dar entrada no estoque dos respectivos itens.

### RF0044 — Gerar cupom de troca após recebimento de itens

O sistema deverá gerar um cupom de troca quando o administrador informar que os itens a serem trocados chegaram. Este cupom deverá ser disponibilizado para o cliente utilizar em futuras compras.

## Requisitos não funcionais

### RNF0042 — Apresentar itens retirados do carrinho

Devem ser apresentados na listagem de itens do carrinho os produtos removidos por atingirem o prazo determinado para finalização da compra (apresentar o tempo conforme parâmetro do sistema). Assim, a opção de comprar deve ser desabilitada e os itens deverão ser adicionados novamente ao carrinho.

## Regras de negócio

### RN0031 — Validar estoque para adição de itens no carrinho

Não deve ser permitido adicionar ao carrinho de compra um item que não esteja disponível em estoque. Também deve ser validada a quantidade do item adicionado ao carrinho, para que não sejam adicionados mais itens do que o disponível em estoque.

### RN0032 — Validar estoque para compra

Caso o estoque seja alterado entre a adição ao carrinho e a finalização da compra, o sistema deve:

- Exibir uma notificação ao usuário informando a mudança na disponibilidade do item.
- Atualizar automaticamente a quantidade disponível no carrinho.
- Remover itens automaticamente caso fiquem indisponíveis, com uma mensagem de alerta.

### RN0033 — Uso de cupom promocional para pagamento

Apenas um cupom promocional pode ser utilizado por compra.

### RN0034 — Uso de diversos cartões de crédito

Uma compra pode ser paga utilizando mais de um cartão de crédito, porém o valor mínimo a ser pago com cada cartão deve ser R$ 10,00.

### RN0035 — Uso de cupons junto a cartão de crédito

Ao realizar pagamento utilizando cupons e cartões de crédito em conjunto, deve-se sempre considerar o valor máximo dos cupons.

Somente neste caso é permitido realizar no cartão um pagamento de valor menor que R$ 10,00. Exemplo: em uma compra de R$ 35,00, o cliente pode pagar R$ 30,00 utilizando cupons de troca ou promocionais e pagar R$ 5,00 com cartão de crédito.

### RN0036 — Gerar cupom de troca

Um cupom de troca deve ser gerado quando uma compra for paga com outros cupons cujo valor supere o valor da compra.

O sistema não deve possibilitar o uso de cupons que supere a compra desnecessariamente. Exemplo: a venda tem valor total de R$ 50,00 e o cliente possui três cupons, com valores de R$ 20,00, R$ 40,00 e R$ 35,00. O sistema não deve possibilitar o uso dos três cupons nesta compra; deve aceitar apenas dois cupons e, consequentemente, gerar um cupom com a diferença de R$ 5,00, R$ 10,00 ou R$ 25,00.

### RN0037 — Validar forma de pagamento para finalização de compra

Após a finalização da compra, a forma de pagamento deve ser validada. Para tal, deve-se validar a validade e a veracidade dos cupons de troca e promocionais utilizados.

Também deve ser validado o aceite da compra pela respectiva operadora de cartão de crédito.

> Comentário presente no documento: isso pode ser simulado através de um método estático ou uma tabela fake. Em caso de dúvidas, consulte os colegas presentes na aula.

### RN0038 — Alterar status da compra conforme processo de aprovação da forma de pagamento

Caso as formas de pagamento tenham sido validadas com sucesso, a compra deve passar a ter o status `APROVADA`. Caso contrário, deve passar a ter o status `REPROVADA`.

### RN0039 — Alterar status da compra para transporte

Toda compra selecionada para ser entregue por um administrador deve ter seu status alterado para `EM TRANSPORTE`.

### RN0040 — Alterar status da compra após entrega

Toda compra selecionada como entregue por um administrador deve ter seu status alterado para `ENTREGUE`.

### RN0041 — Gerar pedido de troca

Todo item selecionado para troca deve gerar um pedido de troca. Este pedido deverá ter o status `EM TROCA`.

Caso o cliente solicite a troca de toda a compra, o status do pedido deverá ser `EM TROCA`.

### RN0042 — Alterar status do pedido após recebimento de troca

Ao confirmar que os itens de um pedido de troca ou uma compra com status `EM TROCA` foram recebidos, o status do pedido ou da compra deverá ser `TROCADO`.

### Rn0043 — Validação para solicitar troca

Somente itens de pedidos com status `ENTREGUE` poderão receber solicitação de troca.

> Nota de conversão: a capitalização `Rn0043` é a que consta no PDF.

### RN0044 — Bloqueio de produtos

- Ao adicionar o item ao carrinho, este deverá ser temporariamente bloqueado para que novas compras não sejam solicitadas. Tal bloqueio só deve ser retirado caso a compra que gerou esse status não seja efetivada ou aprovada em um prazo parametrizado. O prazo deve levar em consideração o momento do bloqueio e ser relativo ao último item incluído no carrinho.
- Um item bloqueado no carrinho terá um tempo limite parametrizável antes de ser removido.
- O usuário será notificado 5 minutos antes de o bloqueio expirar.
- Se o tempo limite expirar, os itens serão removidos e desbloqueados para outros clientes.

### RNF0045 — Retirar item do carrinho

Toda vez que um item for desbloqueado, todos os itens do mesmo produto deverão ser retirados do carrinho de compra que gerou o prazo de bloqueio.

> Nota de conversão: este item consta na seção de regras de negócio do PDF com o prefixo `RNF`.

### RNF0046 — Gerar notificação de autorização de troca

Quando o administrador autorizar uma troca, o sistema deverá gerar uma notificação sobre tal autorização ao cliente.

> Nota de conversão: este item consta na seção de regras de negócio do PDF com o prefixo `RNF`.
