# Infraestrutura, apresentação e composição

Estas camadas conectam as abstrações a mecanismos concretos. Elas não criam
novas regras de negócio.

## Repositório abstrato em memória

`InMemoryAbstractEntityRepository<E>` implementa:

- `AddRepository`;
- `FindByIdRepository`;
- `FindAllRepository`;
- `UpdateRepository`.

Comportamentos fornecidos:

- armazenamento em vetor;
- geração incremental de identificador;
- detecção de identificadores duplicados;
- atualização de `updatedAt`;
- filtro extensível por `matchesSearch`;
- ordenação por propriedade;
- paginação;
- hook `seed()`.

Extensão mínima:

```ts
class InMemoryExampleRepository
    extends InMemoryAbstractEntityRepository<Example>
    implements ExampleRepository {
    protected override matchesSearch(
        entity: Example,
        search: ExampleSearch
    ): boolean {
        return search.name === undefined
            || entity.name.includes(search.name);
    }
}
```

Cuidados:

- o repositório retorna entidades inativas se `matchesSearch` não as excluir;
- `seed()` é chamado pelo construtor da classe-base; ele não deve depender de
  campos da subclasse que ainda não foram inicializados;
- esse adapter é adequado ao ambiente atual e testes, não substitui uma
  persistência durável;
- um adapter de banco deve implementar as mesmas portas e conservar a semântica
  de `EntityPage`.

## Criptografia

`ScryptAdapter` implementa simultaneamente `Encrypter` e `Validator`.

- gera salt aleatório;
- deriva a chave com `scrypt`;
- armazena `salt:hash`;
- compara com `timingSafeEqual`.

O adapter fica na infraestrutura porque Node Crypto é detalhe técnico.

## Tradução padrão

`DefaultMessageTranslator` implementa `MessageTranslator` com catálogo
`pt-BR`. Ele substitui marcadores como `{id}` pelos parâmetros da mensagem.

Ao adicionar uma `MessageKeyEnum`, atualize o catálogo. A ausência de texto
para uma chave quebra a expectativa de tradução.

## Filtro global de exceções

`DefaultExceptionFilter`:

1. reconhece `CustomError`;
2. normaliza exceções HTTP conhecidas;
3. converte erros desconhecidos em `INTERNAL_ERROR`;
4. traduz a chave usando `Accept-Language`;
5. devolve:

```json
{
  "status": "BAD_REQUEST",
  "message": "Parâmetro inválido: email.",
  "timestamp": "2026-07-26T12:00:00.000Z"
}
```

Mapeamento HTTP:

| `ErrorStatusEnum` | HTTP |
|---|---:|
| `BAD_REQUEST` | 400 |
| `UNAUTHENTICATED` | 401 |
| `UNAUTHORIZED` | 403 |
| `NOT_FOUND` | 404 |
| `INTERNAL_ERROR` | 500 |

O filtro é adapter HTTP. `CustomError` continua independente de HTTP.

## Request abstrata

`Request` recebe `unknown` e oferece parsers protegidos:

- obrigatório: `required`;
- texto e e-mail: `string`, `email`;
- números: `number`, `integer`, `positiveNumber`, `positiveInteger`;
- estrutura: `boolean`, `object`;
- opcionais: `optionalString`, `optionalInteger`;
- enum: `enumValue`;
- autenticação: `bearerToken`.

Campo ausente lança `BadRequest(MISSING_PARAM)`. Campo presente e inválido
lança `BadRequest(INVALID_PARAM)`.

Uma request concreta converte transporte em DTO:

```ts
class CreateExampleRequest extends Request {
    public readonly input: CreateExampleDto;

    public constructor(data: unknown) {
        super(data);
        this.input = new CreateExampleDto(
            this.string("name")
        );
    }
}
```

Controller não deve repetir validação manual nem repassar `body: any`.

## `SharedModule`

O módulo Nest atual registra:

- `ScryptAdapter`;
- `DefaultMessageTranslator` sob `MESSAGE_TRANSLATOR`;
- `DefaultExceptionFilter` sob `APP_FILTER`.

Somente `ScryptAdapter` é exportado explicitamente. O filtro é global e o
tradutor atende sua injeção dentro do módulo.

```ts
@Module({
    providers: [
        ScryptAdapter,
        {
            provide: MESSAGE_TRANSLATOR,
            useClass: DefaultMessageTranslator
        },
        {
            provide: APP_FILTER,
            useClass: DefaultExceptionFilter
        }
    ],
    exports: [ScryptAdapter]
})
export class SharedModule { }
```

Casos de uso genéricos não precisam ser providers globais. Cada módulo
consumidor deve construí-los com seu mapper, suas regras e seu repositório.
