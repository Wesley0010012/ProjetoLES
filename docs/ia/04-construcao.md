# Como construir o módulo Shared

Este roteiro reconstrói o módulo na ordem das dependências, evitando ciclos.

## 1. Criar a base do domínio

Implemente primeiro:

1. `AbstractEntityProps` e `AbstractEntity`;
2. `EntityPage`;
3. `OrderDirection`;
4. `Search` e `SearchProps`.

Critérios:

- entidade não importa aplicação;
- busca não conhece query HTTP;
- página contém entidades, nunca DTOs;
- exclusão lógica atualiza `active` e `updatedAt`.

## 2. Criar as portas de persistência

Crie uma interface por capacidade:

```text
AddRepository
FindByIdRepository
FindAllRepository
UpdateRepository
```

Depois componha `CrudRepository`. Essa segregação permite que um caso de uso
dependa somente do método necessário.

## 3. Criar erros e mensagens

Ordem:

1. `ErrorStatusEnum`;
2. `MessageKeyEnum`;
3. `Message` e `MessageParams`;
4. `CustomError`;
5. especializações por estado.

Nunca armazene texto traduzido em um erro de domínio.

## 4. Criar protocolos técnicos do domínio

Defina `Encrypter` e `Validator` antes do adapter criptográfico. Casos de uso
que manipulam senha recebem essas interfaces por construtor.

## 5. Criar os DTOs-base

Implemente:

- `InputDto`;
- `AddInput`;
- `UpdateInput`, incluindo `id`;
- `OutputDto`;
- `EntityPageDto`.

DTOs específicos continuam nos módulos consumidores.

## 6. Criar os protocolos da aplicação

Implemente os mappers, `Rule`, `RulesMap`,
`EntityRelationshipAccessor` e `MessageTranslator`.

Neste ponto já existe tudo que os casos de uso genéricos precisam.

## 7. Criar os casos de uso genéricos

Ordem recomendada:

1. `AddEntity`;
2. `FindEntityById`;
3. `FindAll`;
4. `UpdateEntity`;
5. `DeleteEntityById`;
6. casos de relacionamento.

Cada caso de uso deve:

- expor `execute`;
- receber dependências no construtor;
- usar portas em vez de classes concretas;
- retornar DTO ou `void`;
- lançar erros controlados nas ausências esperadas.

Não crie `CreateBook`, `RecordAuditLog` ou outra classe que apenas repita
integralmente um genérico. Crie um caso específico somente quando existir
orquestração ou regra de fluxo que o genérico não representa.

## 8. Criar adapters

Implemente:

- `InMemoryAbstractEntityRepository`;
- `ScryptAdapter`;
- `DefaultMessageTranslator`;
- `DefaultExceptionFilter`.

Teste cada adapter contra sua porta. Uma futura troca por banco ou outro
algoritmo não deve alterar os casos de uso.

## 9. Criar a base de requests

Implemente `Request` por último na apresentação, pois ela depende dos erros e
mensagens já definidos.

Mantenha nela apenas validações estruturais reutilizáveis. Regras como
unicidade, limite de estoque ou força de senha pertencem a regras/casos de uso.

## 10. Compor o `SharedModule`

Registre os adapters que dependem do container:

```text
MESSAGE_TRANSLATOR -> DefaultMessageTranslator
APP_FILTER         -> DefaultExceptionFilter
ScryptAdapter      -> provider exportado
```

Não registre entidades, mappers ou repositórios de negócio no `SharedModule`.

## Checklist arquitetural

- [ ] `shared` não importa módulos de negócio.
- [ ] domínio não importa Nest.
- [ ] aplicação não importa adapters concretos.
- [ ] casos de uso recebem portas pelo construtor.
- [ ] entidades não são retornadas diretamente por controllers.
- [ ] requests recebem `unknown`.
- [ ] erros usam chaves traduzíveis.
- [ ] delete genérico é desativação.
- [ ] paginação é produzida pelo repositório.
- [ ] regras são compostas por `RulesMap`.
- [ ] adapters podem ser trocados sem alterar casos de uso.
- [ ] classes específicas não duplicam casos de uso genéricos.
