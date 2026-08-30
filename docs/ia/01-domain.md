# Abstrações do domínio

O domínio compartilhado define os conceitos mais estáveis. Nada nesta camada
deve conhecer controller, HTTP, Nest, banco de dados ou serialização.

## `AbstractEntity`

`AbstractEntity<Props>` fornece o ciclo de vida comum:

- `id`, atribuído pela persistência;
- `active`, iniciado como `true`;
- `createdAt` e `updatedAt`, iniciados com a data atual;
- `touch()`, que atualiza `updatedAt`;
- `deactivate()`, que implementa exclusão lógica;
- `isActive()`, que consulta o estado.

Uma entidade concreta estende essa base e expõe apenas os dados do próprio
domínio:

```ts
type ExampleProps = AbstractEntityProps & {
    name: string
}

class Example extends AbstractEntity<ExampleProps> {
    public get name(): string {
        return this._props.name;
    }

    public set name(value: string) {
        this._props.name = value;
    }
}
```

Observações da implementação atual:

- apesar do nome, `AbstractEntity` não usa a palavra-chave TypeScript
  `abstract`;
- o getter `id` pressupõe que a persistência já atribuiu um identificador;
- remoção genérica é desativação, não exclusão física;
- `deactivate()` também chama `touch()`.

## `EntityPage`

`EntityPage<Entity>` é o resultado de domínio de uma busca:

```ts
new EntityPage(totalEntities, entities, totalPages)
```

Ela não contém DTOs. A conversão acontece na aplicação.

Sem paginação, o repositório ainda produz uma `EntityPage`; é o caso de uso
`FindAll` que decide devolver somente o vetor.

## Busca

`Search` é a base abstrata das buscas e recebe:

- `orderBy`;
- `orderDirection`, padrão `ASC`;
- `page`;
- `pageSize`.

`page` e `pageSize` devem ser informados juntos e precisam ser inteiros
positivos. `isPaginated()` indica qual formato de resposta o `FindAll` usará.

Cada módulo deve criar uma busca concreta para limitar filtros e ordenações ao
seu próprio vocabulário:

```ts
class ExampleSearch extends Search {
    public constructor(props: SearchProps) {
        super(props);
    }
}
```

`OrderDirection` possui `ASC` e `DESC`.

## Portas de repositório

As interfaces são segregadas por capacidade:

| Porta | Operação |
|---|---|
| `AddRepository<E>` | `add(entity): Promise<void>` |
| `FindByIdRepository<E>` | `findById(id): Promise<E \| null>` |
| `FindAllRepository<E>` | `findAll(search): Promise<EntityPage<E>>` |
| `UpdateRepository<E>` | `update(entity): Promise<void>` |

`CrudRepository<E>` agrega essas quatro portas. Não existe uma porta genérica
de exclusão: `DeleteEntityById` localiza, desativa e atualiza a entidade.

Um domínio pode declarar um micro repositório com somente o necessário:

```ts
interface ExampleRepository
    extends AddRepository<Example>, FindAllRepository<Example> {
    existsByName(name: string): Promise<boolean>
}
```

Use `CrudRepository` somente quando o consumidor realmente oferece todas as
capacidades.

## Erros abstratos

`CustomError` é a raiz dos erros controlados. Ele transporta:

- `status: ErrorStatusEnum`;
- `messageKey: MessageKeyEnum`;
- `messageParams`, usados na interpolação.

Especializações existentes:

| Erro | Estado |
|---|---|
| `BadRequest` | `BAD_REQUEST` |
| `Unauthenticated` | `UNAUTHENTICATED` |
| `Unauthorized` | `UNAUTHORIZED` |
| `NotFound` | `NOT_FOUND` |
| `InternalError` | `INTERNAL_ERROR` |

O domínio lança chaves sem texto traduzido:

```ts
throw new NotFound(
    MessageKeyEnum.ENTITY_NOT_FOUND,
    { id }
);
```

Isso evita acoplar regra de negócio a idioma ou HTTP.

## Mensagens

`Message` é formado por uma chave e parâmetros. `MessageParams` aceita
`string`, `number`, `boolean` e `Date`.

`MessageKeyEnum` é o catálogo estável utilizado por domínio e aplicação. Ao
adicionar uma chave, todo tradutor concreto deve receber uma mensagem
correspondente.

## Criptografia

As portas são pequenas e independentes:

```ts
interface Encrypter {
    encrypt(plaintext: string): Promise<string>
}

interface Validator {
    validate(
        plaintext: string,
        encryptedText: string
    ): Promise<boolean>
}
```

Casos de uso dependem dessas interfaces, nunca de `scrypt`, bibliotecas ou
detalhes de armazenamento.

## Value Objects compartilhados

O diretório também possui `Email`, `Phone` e a hierarquia abstrata
`Document`/`CPF`. Eles representam valores recorrentes e não devem assumir
responsabilidades de transporte ou persistência.

Um novo VO compartilhado só deve ser criado quando o mesmo conceito e as
mesmas invariantes forem válidos em vários módulos. Caso contrário, ele
pertence ao domínio específico.
