# Módulo Cadastro de Livros

> Fonte: `docs/source/DRS_LES_1_2026 (3).pdf`.

## Requisitos funcionais

### RF0011 — Cadastrar livro

O sistema deve manter um cadastro único para livros.

### RF0012 — Inativar cadastro de livro

O sistema deve possibilitar que livros sejam inativados.

### RF0013 — Inativar livro de forma automática

O sistema deve inativar livros sem estoque e que não possuem venda com valor inferior a parâmetro predefinido no sistema.

### RF0014 — Alterar cadastro de livro

O sistema deve possibilitar a alteração de dados cadastrais para os livros.

### RF0015 — Consulta de livros

O sistema deve possibilitar que um livro seja consultado com base em um filtro definido pelo usuário. Todos os campos utilizados para identificação do livro podem ser utilizados como filtro, tanto de forma combinada como de forma isolada.

### RF0016 — Ativar cadastro de livros

Deve ser possível ativar o cadastro de um livro.

## Requisitos não funcionais

### RNF0021 — Código de livro

Todo livro cadastrado deve receber um código único no sistema.

## Regras de negócio

### RN0011 — Dados obrigatórios para o cadastro de um livro

Para todo livro cadastrado é obrigatório o cadastro dos seguintes dados: autor, categoria, ano, título, editora, edição, ISBN, número de páginas, sinopse, dimensões (altura, largura, peso e profundidade), grupo de precificação e código de barras.

### RN0012 — Associação com categorias

Um livro pode estar associado com mais de uma categoria.

### RN0013 — Definindo valor de venda

Todo livro após cadastrado deverá ser associado a um grupo de precificação onde o valor deverá ter como base a margem de lucro parametrizada para o grupo definido no cadastro do livro.

### RN0014 — Validar margem de lucro

Um livro somente pode ter seu valor alterado se estiver dentro da margem de lucro definida pelo critério de grupo de precificação. Para um livro ter seu valor alterado para baixo da margem de lucro definida pelo grupo de precificação é necessária uma autorização de um gerente de vendas.

### RN0015 — Associar motivo de inativação

Todo livro que for inativado manualmente deve ter uma justificativa e uma categoria de inativação associada.

### RN0016 — Associar motivo de inativação automática

Todo cadastro de livro inativado de forma automática deve ser categorizado como `FORA DE MERCADO`.

### RN0017 — Associar motivo de ativação

Todo livro que for ativado deve ter uma justificativa e uma categoria de ativação associada.
