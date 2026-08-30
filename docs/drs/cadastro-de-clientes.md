# Módulo Cadastro de Clientes

> Fonte: `docs/source/DRS_LES_1_2026 (3).pdf`.

## Requisitos funcionais

### RF0021 — Cadastrar cliente

O sistema deve possibilitar o cadastro de clientes.

### RF0022 — Alterar cliente

O sistema deve possibilitar a alteração de dados cadastrais de clientes.

### RF0023 — Inativar cadastro de cliente

O sistema deve possibilitar que clientes sejam inativados.

### RF0024 — Consulta de clientes

O sistema deve possibilitar que um cliente seja consultado com base em um filtro definido pelo usuário. Todos os campos utilizados para identificação do cliente podem ser utilizados como filtro, tanto de forma combinada como de forma isolada.

### RF0025 — Consulta de transações

O sistema deve disponibilizar no cadastro de clientes a consulta de todas as transações já realizadas pelo mesmo.

### RF0026 — Cadastro de endereços de entrega

Deve ser possível associar diversos endereços de entrega ao cadastro de um cliente. Cada cadastro de endereço deve ser identificado com um nome composto de uma frase curta.

### RF0027 — Cadastro de cartões de crédito

Deve ser possível associar diversos cartões de crédito ao cadastro de um cliente. Deve haver um cartão de crédito configurado como preferencial.

### RF0028 — Alteração apenas de senha

O sistema deve possibilitar que a senha do usuário seja alterada sem que seja necessária a alteração de todos os dados cadastrais.

## Requisitos não funcionais

### RNF0031 — Senha forte

A senha cadastrada pelo usuário deve ser composta de pelo menos 8 caracteres, ter letras maiúsculas e minúsculas, além de conter caracteres especiais.

### RNF0032 — Confirmação de senha

O usuário obrigatoriamente deve digitar duas vezes a mesma senha no momento do registro da mesma.

### RNF0033 — Senha criptografada

A senha deve ser criptografada.

### RF0034 — Alteração apenas de endereços

O sistema deve possibilitar que endereços de entrega ou cobrança possam ser alterados ou adicionados de forma simples sem a necessidade da edição dos demais dados cadastrais.

> Nota de conversão: o identificador acima consta como `RF0034` no PDF, embora esteja na seção de requisitos não funcionais.

### RNF0035 — Código de cliente

Todo cliente cadastrado deve receber um código único no sistema.

## Regras de negócio

### RN0021 — Cadastro de endereço de cobrança

Para todo cliente cadastrado é obrigatório o registro de ao menos um endereço de cobrança.

### RN0022 — Cadastro de endereço de entrega

Para todo cliente cadastrado é obrigatório o registro de ao menos um endereço de entrega.

### RN0023 — Composição do registro de endereços

Todo cadastro de endereços associados a clientes deve ser composto dos seguintes dados: tipo de residência (casa, apartamento etc.), tipo de logradouro, logradouro, número, bairro, CEP, cidade, estado e país. Todos os campos anteriores são de preenchimento obrigatório. Opcionalmente pode ser preenchido um campo de observações.

### RN0024 — Composição do registro de cartões de crédito

Todo cartão de crédito associado a um cliente deverá ser composto pelos seguintes campos: nº do cartão, nome impresso no cartão, bandeira do cartão e código de segurança.

### RN0025 — Bandeiras permitidas para registro de cartões de crédito

Todo cartão de crédito associado a um cliente deverá ser de alguma bandeira registrada no sistema.

### RN0026 — Dados obrigatórios para o cadastro de um cliente

Para todo cliente cadastrado é obrigatório o cadastro dos seguintes dados: gênero, nome, data de nascimento, CPF, telefone (deve ser composto pelo tipo, DDD e número), e-mail, senha e endereço residencial.

### RN0027 — Ranking de cliente

O cliente deve receber um ranking numérico com base no seu perfil de compra.

### RN0028 — Validar retorno da operadora de cartão de crédito

Somente deve-se dar baixa no estoque de itens cuja compra tenha sido efetivada, isto é, cujo status não seja mais `EM PROCESSAMENTO`. Todo item que faça parte de uma compra não aprovada deve ser desbloqueado e mantido em estoque.
