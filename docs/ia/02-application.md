# Abstrações da aplicação

A aplicação orquestra entidades e portas. Ela não conhece Nest, HTTP nem a
implementação concreta do banco.

## DTOs-base

```text
InputDto
├── AddInput
└── UpdateInput

OutputDto
└── EntityPageDto<EntityDto>
```

- `InputDto` marca entradas da aplicação.
- `AddInput` marca dados de criação.
- `UpdateInput` exige e expõe `id`.
- `OutputDto` marca saídas serializáveis.
- `EntityPageDto` contém `totalEntities`, `entities` e `totalPages`.

Essas classes não validam requisições HTTP. A camada de apresentação cria DTOs
válidos antes de chamar a aplicação.

## Portas de mapeamento

Os mappers separam entidade, entrada e saída:

| Interface | Responsabilidade |
|---|---|
| `AddInputToEntity<I, E>` | criar uma entidade a partir de `AddInput` |
| `UpdateInputToEntity<I, E>` | aplicar dados de `UpdateInput` à entidade |
| `EntityToOutputDto<E, O>` | converter entidade em `OutputDto` |
| `EntityPageToEntityPageDto<E, O>` | converter página e todos os seus itens |

Os métodos são assíncronos. Um único mapper concreto pode implementar as três
interfaces usadas pelo CRUD:

```ts
class ExampleMapper implements
    AddInputToEntity<CreateExampleDto, Example>,
    UpdateInputToEntity<UpdateExampleDto, Example>,
    EntityToOutputDto<Example, ExampleDto> {
    // toEntity, updateData e toDto
}
```

O mapper não deve decidir fluxo de caso de uso. Ele apenas converte ou aplica
dados.

## Regras

`Rule<T>` define:

```ts
validate(data: T): Promise<void>
```

Uma regra termina silenciosamente quando válida e lança um `CustomError`
quando inválida.

`RulesMap<T>` compõe regras e as executa sequencialmente na ordem recebida.
Uma coleção vazia representa um fluxo sem regras adicionais:

```ts
const rules = new RulesMap<Example>([
    new UniqueExampleName(repository),
    new ValidExampleState()
]);
```

Regras devem ser pequenas e possuir uma única razão para mudar.

## `AddEntity`

Fluxo:

```text
AddInput
   │
   ▼
mapper.toEntity
   │
   ▼
RulesMap.validate
   │
   ▼
AddRepository.add
   │
   ▼
mapper.toDto
```

Dependências:

- `AddInputToEntity`;
- `RulesMap`;
- `AddRepository`;
- `EntityToOutputDto`.

Retorna o DTO da entidade já persistida, portanto o repositório deve atribuir
o identificador antes da conversão final.

## `UpdateEntity`

Fluxo:

1. procura a entidade pelo `input.id`;
2. lança `NotFound` quando ausente;
3. aplica os dados pelo mapper;
4. valida o novo estado;
5. atualiza no repositório;
6. converte para DTO.

Ele depende separadamente de `FindByIdRepository` e `UpdateRepository`. A mesma
instância concreta pode implementar ambas.

## `DeleteEntityById`

Fluxo:

1. localiza pelo identificador;
2. lança `NotFound` quando ausente;
3. chama `entity.deactivate()`;
4. persiste pelo `UpdateRepository`.

O contrato retorna `Promise<void>`. Na apresentação, normalmente corresponde
a HTTP `204 No Content`.

## `FindEntityById`

Localiza a entidade, lança `NotFound` quando necessário e usa
`EntityToOutputDto` para impedir que a camada externa receba a entidade
diretamente.

## `FindAll`

Recebe uma `Search`, solicita uma `EntityPage` ao repositório e converte tudo
para DTO.

- busca paginada: retorna `EntityPageDto<EntityDto>`;
- busca não paginada: retorna `EntityDto[]`.

O consumidor deve conhecer essa união ou restringir o tipo de busca usado pela
rota.

## Relacionamentos

`EntityRelationshipAccessor<Owner, Related>` abstrai como ler e alterar uma
coleção da entidade proprietária:

```ts
const accessor = {
    get: (book: Book) => book.authors,
    set: (book: Book, authors: Author[]) => {
        book.authors = authors;
    }
};
```

`AbstractEntityRelationship` concentra a busca do proprietário e da entidade
relacionada, com tratamento de `NotFound`.

Especializações:

- `AddEntityRelationship`: adiciona sem duplicar;
- `RemoveEntityRelationship`: remove pelo identificador;
- `ChangeEntityRelationship`: substitui uma relação existente.

Esses casos de uso exigem `CrudRepository` dos dois lados e persistem a entidade
proprietária por `update`.

## Tradução

`MessageTranslator` é a porta da aplicação:

```ts
translate(key, params?, locale?): string
```

O token `MESSAGE_TRANSLATOR` permite injetar uma implementação sem acoplar o
filtro global ao tradutor padrão.
