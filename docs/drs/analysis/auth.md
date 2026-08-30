# Análise de Requisitos de Autenticação

> Requisitos consolidados a partir dos documentos em `docs/drs/`.

## Requisitos funcionais

### RF0028 — Alteração apenas de senha

O sistema deve possibilitar que a senha do usuário seja alterada sem que seja necessária a alteração de todos os dados cadastrais.

## Requisitos não funcionais

### RNF0031 — Senha forte

A senha cadastrada pelo usuário deve ser composta de pelo menos 8 caracteres, ter letras maiúsculas e minúsculas, além de conter caracteres especiais.

### RNF0032 — Confirmação de senha

O usuário obrigatoriamente deve digitar duas vezes a mesma senha no momento do registro da mesma.

### RNF0033 — Senha criptografada

A senha deve ser criptografada.

## Regras de negócio relacionadas

### RN0026 — Dados obrigatórios para o cadastro de um cliente

Para todo cliente cadastrado é obrigatório o cadastro dos seguintes dados: gênero, nome, data de nascimento, CPF, telefone (deve ser composto pelo tipo, DDD e número), e-mail, senha e endereço residencial.

## Lacunas do documento de origem

O documento de origem não define requisitos explícitos para:

- Login e logout.
- Identificação usada para autenticação.
- Recuperação ou redefinição de senha esquecida.
- Expiração, renovação e encerramento de sessão.
- Limite de tentativas e bloqueio contra ataques de força bruta.
- Autenticação multifator.
- Autorização por perfil, apesar de mencionar perfis de cliente e administrador em outros requisitos.

Além disso, o requisito RNF0033 emprega o termo “criptografada”. Para armazenamento seguro, recomenda-se especificar que senhas sejam armazenadas por meio de hash lento, com salt individual, e nunca de forma reversível.

## Decisões complementares do projeto

As decisões abaixo complementam o DRS original e passam a orientar a implementação:

- O e-mail identifica o usuário durante o login.
- Todo usuário possui um tipo de acesso: `USER` ou `OPERATOR`.
- O cadastro público (`SignUp`) sempre cria usuários do tipo `USER`.
- O login recebe o tipo de acesso correspondente à página utilizada.
- O login somente é autorizado quando o tipo solicitado coincide com o tipo do usuário.
- O login bem-sucedido cria um `UserToken` com data de expiração.
- O logout inativa o `UserToken` utilizado.
- Clientes acessam a autenticação pela rota `/login`.
- Operadores acessam a autenticação pela rota `/operation/login`.

## Requisitos adicionais

> Os requisitos desta seção não pertencem ao DRS original. Foram adicionados
> durante a evolução do projeto.

### ADICIONAL-AUTH-001 — Impedir reutilização das últimas senhas

Ao cadastrar ou alterar uma senha, o sistema não deve permitir que a nova
senha seja igual a nenhuma das três últimas senhas do usuário, considerando
nesse conjunto a senha atual e as duas senhas anteriores.

Para cumprir a regra, o sistema deve:

- Manter um histórico das três últimas senhas protegidas do usuário.
- Comparar a nova senha com cada registro do histórico por meio do mecanismo
  seguro de validação de hash.
- Nunca armazenar senhas anteriores em texto simples ou com criptografia
  reversível.
- Rejeitar a operação antes de alterar a senha quando houver reutilização.
- Após uma alteração válida, incluir a senha substituída no histórico e
  descartar o registro mais antigo que ultrapassar o limite de três senhas.

Essa regra deve ser aplicada tanto na alteração voluntária de senha quanto na
redefinição realizada pelo fluxo de recuperação.

## Recuperação de senha

A recuperação de senha será dividida em dois passos.

### Passo 1 — Verificar usuário por e-mail

O sistema deve receber um e-mail e verificar se existe um usuário correspondente.

Por segurança, a interface pública não deve revelar se o endereço está ou não cadastrado. A resposta externa deve ser genérica, por exemplo: “Se o e-mail estiver cadastrado, enviaremos as próximas instruções”.

Quando o usuário existir e estiver ativo, o sistema deve:

- Gerar um hash de recuperação.
- Persistir o hash, o usuário relacionado e sua data de expiração como `PasswordRecoveryToken`.
- Enviar ao e-mail do usuário um link contendo o hash de recuperação.

### Passo 2 — Redefinir senha

O sistema deve receber o hash de recuperação, a nova senha e sua confirmação.

O hash somente pode ser utilizado quando existir, estiver ativo e não estiver expirado. A nova senha deve atender às regras de força e confirmação já estabelecidas.

Após alterar e proteger a senha, o sistema deve:

- Persistir o usuário atualizado.
- Inativar o `PasswordRecoveryToken`, impedindo sua reutilização.
- Enviar um e-mail ao usuário informando que a senha foi alterada.

Os dois passos devem publicar a operação sem corpo de resposta.

## Lacunas remanescentes

- Política de revogação de sessões após alteração de senha.
- Limite de tentativas e bloqueio contra força bruta.
- Autenticação multifator.
- Política de renovação de sessão.
- Valor parametrizado para duração do token de recuperação.
- Política para invalidar tokens de recuperação anteriores quando um novo for solicitado.
