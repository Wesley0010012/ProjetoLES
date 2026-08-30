# Módulo Geral

> Fonte: `docs/source/DRS_LES_1_2026 (3).pdf` — Documento de Requisitos, E-commerce de Livros, LES — 1º semestre de 2026.

## Histórico de versões

| Data | Versão | Descrição | Autor |
|---|---:|---|---|
| 20/08/2017 | 0.1 | Versão inicial — cadastro de livros | Rodrigo Rocha Silva |
| 22/08/2017 | 0.2 | Versão com cadastro de clientes | Rodrigo Rocha Silva |
| 11/10/2017 | 0.3 | Versão com requisitos iniciais de vendas | Rodrigo Rocha Silva |
| 30/10/2017 | 0.4 | Versão com requisitos de controle de status de vendas | Turma Segunda e Rodrigo Rocha Silva |
| 12/08/2024 | 0.5 | Adicionado requisito de análise | Rodrigo |
| 15/08/2025 | 0.6 | Melhoria requisitos de IA | Rodrigo |

## Requisitos não funcionais

### RNF0011 — Tempo de resposta para consultas

Toda consulta de usuário deve ter resposta em no máximo 1 segundo.

### RNF0012 — Log de transação

Para toda operação de escrita (inserção ou alteração) deve ser registrado data, hora, usuário responsável, além de manter os dados alterados.

### RNF0013 — Cadastro de domínios

Deve haver um script de implantação do sistema que insere todos os registros de tabelas de domínio necessárias, por exemplo: grupo de precificação, autor, editora, fornecedor etc.
