# Módulo Shared — guia das abstrações

Esta documentação descreve somente as abstrações reutilizáveis do sistema e
explica como reconstruir o módulo `shared`. Ela foi escrita a partir do código
em `backend/src/shared`, não como uma proposta de arquitetura futura.

## Objetivo

O `shared` contém mecanismos que são comuns a mais de um módulo de negócio:

- identidade, ativação e datas das entidades;
- contratos mínimos de persistência;
- DTOs e mapeadores genéricos;
- regras compostas;
- casos de uso CRUD;
- manutenção de relacionamentos;
- paginação e ordenação;
- erros, mensagens e tradução;
- criptografia por abstrações;
- validação da entrada HTTP;
- adapters compartilhados e composição Nest.

Ele não deve conter regras próprias de livros, clientes, usuários, estoque,
vendas ou auditoria.

## Regra de dependência

```text
presentation ──> application ──> domain
       │               │
       └──> infrastructure ──> application/domain

shared/domain         não depende de Nest ou infraestrutura
shared/application    depende das abstrações do domínio
shared/infrastructure implementa portas internas
shared/presentation   transforma transporte em entrada confiável
```

Um módulo de negócio pode importar o `shared`. O `shared` nunca deve importar
um módulo de negócio.

## Índice

1. [Abstrações do domínio](./01-domain.md)
2. [Abstrações da aplicação](./02-application.md)
3. [Infraestrutura, apresentação e composição](./03-adapters-e-composicao.md)
4. [Como construir o módulo Shared](./04-construcao.md)
5. [Como um módulo consumidor usa o Shared](./05-integracao.md)

## Estrutura de referência

```text
shared/
├── domain/
│   ├── entities/
│   ├── enums/
│   ├── errors/
│   ├── messages/
│   ├── protocols/
│   ├── repositories/
│   └── vo/
├── application/
│   ├── dto/
│   ├── protocols/
│   └── usecases/
├── infrastructure/
│   ├── cryptography/
│   ├── filters/
│   ├── persistence/
│   └── translations/
├── presentation/
│   └── requests/
└── shared.module.ts
```

## Princípio central

Os casos de uso genéricos só conhecem portas. A entidade, o DTO, o mapper, as
regras e o repositório concreto são fornecidos pelo módulo consumidor. Assim,
`AddEntity` pode criar qualquer entidade sem conhecer qualquer domínio
específico.
