# Módulo Controle de Estoque

> Fonte: `docs/source/DRS_LES_1_2026 (3).pdf`.

## Requisitos funcionais

### RF0051 — Realizar entrada em estoque

O sistema deve permitir a entrada de itens de livros em estoque. No registro de cada item, deve ser indicado o livro previamente cadastrado e a quantidade de itens do livro.

### RF0052 — Calcular valor de venda

O sistema deve calcular o valor de venda com base no valor de custo e no grupo de precificação. O valor de venda será o valor de compra mais o percentual definido no grupo de precificação relacionado ao livro.

### RF0053 — Dar baixa em estoque

Para cada venda realizada deve-se dar baixa no estoque do total de itens vendidos.

### RF0054 — Realizar reentrada em estoque

O sistema deve realizar a reentrada de um item em estoque a partir da troca de um produto.

## Regras de negócio

### RN0051 — Validar dados de estoque

Para cada entrada em estoque, deve ser obrigatoriamente informado o produto, a quantidade, o valor de custo, o fornecedor e a data de entrada dos itens de produto.

### RN005x — Definir valor de item com diferentes custos

Quando itens de um determinado livro forem registrados com valores de custo diferentes, deverá ser calculado o valor de venda com base no grupo de precificação. Porém, os valores de todos os itens deverão ser iguais, considerando o maior valor de custo.

> Nota de conversão: o identificador `RN005x` é o que consta no PDF.

### RN0061 — Quantidade de itens

Não deve ser permitido realizar a entrada de itens de livros com quantidade igual a zero.

### RN0062 — Valor de custo

Para todo item deve haver um valor de custo.

### RNF0064 — Data de entrada

Não deve ser permitido que itens sejam registrados sem que uma data de entrada seja registrada.

> Nota de conversão: este item consta na seção de regras de negócio do PDF com o prefixo `RNF`.
