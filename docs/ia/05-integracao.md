# Como um módulo consumidor usa o Shared

Este capítulo mostra a montagem abstrata de um CRUD sem introduzir uma regra de
negócio específica.

## Peças que pertencem ao módulo consumidor

Para uma entidade `Example`, crie:

```text
domain/entities/Example.ts
domain/repositories/ExampleRepository.ts
application/dto/CreateExampleDto.ts
application/dto/UpdateExampleDto.ts
application/dto/ExampleDto.ts
application/mappers/ExampleMapper.ts
application/rules/*
application/ExampleSearch.ts
infrastructure/persistence/.../ExampleRepositoryAdapter.ts
presentation/requests/*
presentation/controllers/*
example.module.ts
```

O `shared` fornece o motor; o módulo fornece os tipos e decisões do domínio.

## Contrato do repositório

```ts
interface ExampleRepository
    extends CrudRepository<Example> {
    existsByName(name: string): Promise<boolean>
}
```

O adapter em memória pode estender
`InMemoryAbstractEntityRepository<Example>`. Um adapter persistente implementa
a mesma interface diretamente.

## DTOs

```ts
class CreateExampleDto extends AddInput {
    public constructor(public readonly name: string) {
        super();
    }
}

class UpdateExampleDto extends UpdateInput {
    public constructor(
        id: number,
        public readonly name: string
    ) {
        super(id);
    }
}

class ExampleDto extends OutputDto {
    public constructor(
        public readonly id: number,
        public readonly name: string,
        public readonly active: boolean
    ) {
        super();
    }
}
```

## Mapper

```ts
class ExampleMapper implements
    AddInputToEntity<CreateExampleDto, Example>,
    UpdateInputToEntity<UpdateExampleDto, Example>,
    EntityToOutputDto<Example, ExampleDto> {

    public async toEntity(
        input: CreateExampleDto
    ): Promise<Example> {
        return new Example({ name: input.name });
    }

    public async updateData(
        input: UpdateExampleDto,
        entity: Example
    ): Promise<void> {
        entity.name = input.name;
    }

    public async toDto(entity: Example): Promise<ExampleDto> {
        return new ExampleDto(
            entity.id,
            entity.name,
            entity.active
        );
    }
}
```

## Composição dos casos de uso

O módulo monta os genéricos uma única vez:

```ts
const mapper = new ExampleMapper();
const rules = new RulesMap<Example>([
    // regras concretas do módulo
]);

const useCases = {
    create: new AddEntity(
        mapper,
        rules,
        repository,
        mapper
    ),
    update: new UpdateEntity(
        repository,
        mapper,
        rules,
        repository,
        mapper
    ),
    delete: new DeleteEntityById(
        repository,
        repository
    ),
    findById: new FindEntityById(
        repository,
        mapper
    ),
    findAll: new FindAll(
        repository,
        new EntityPageToEntityPageDto(mapper)
    )
};
```

No Nest, esse objeto pode ser fornecido por um token específico do módulo.
Controller injeta o token e chama `execute`; ele não recebe o repositório.

## Entrada HTTP

Uma request concreta deve:

1. receber `unknown`;
2. validar presença e tipo usando `Request`;
3. produzir `AddInput`, `UpdateInput`, identificador ou `Search`;
4. ser usada pela controller antes do caso de uso.

```text
HTTP body/query/params
        │
        ▼
ConcreteRequest
        │
        ▼
DTO ou Search
        │
        ▼
caso de uso genérico
```

## Quando criar um caso de uso específico

Crie uma classe própria quando o fluxo:

- coordena mais de uma entidade ou repositório;
- possui transação;
- chama gateway externo;
- publica evento ou envia e-mail;
- exige autorização de domínio;
- possui retorno ou sequência que não cabe no genérico.

Não crie uma classe própria quando ela apenas:

- chama `repository.add`;
- chama `repository.findAll`;
- localiza e mapeia por identificador;
- altera campos, valida e atualiza;
- desativa uma entidade.

Nesses casos, configure `AddEntity`, `FindAll`, `FindEntityById`,
`UpdateEntity` ou `DeleteEntityById`.

## Fluxo completo

```text
Controller
  └─ ConcreteRequest
      └─ AddInput / UpdateInput / Search
          └─ Use case genérico
              ├─ Mapper
              ├─ RulesMap
              ├─ Repository port
              └─ OutputDto
                  └─ resposta HTTP

Erro em qualquer etapa
  └─ CustomError + MessageKey
      └─ DefaultExceptionFilter
          └─ MessageTranslator
              └─ JSON padronizado
```

Essa composição é o padrão esperado para todos os módulos do sistema.
