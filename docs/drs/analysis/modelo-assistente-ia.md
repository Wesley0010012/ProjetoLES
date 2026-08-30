# Modelo de IA e Assistente Virtual da Libra

## 1. Objetivo

Atender ao RNF0044 por meio de um assistente conversacional capaz de:

- auxiliar na descoberta e comparação de livros;
- responder dúvidas sobre catálogo, conta, carrinho, pagamento, pedidos e trocas;
- usar produtos, disponibilidade e preços atuais como contexto;
- evoluir para personalização por histórico de compras, preferências e feedback;
- manter o sistema funcional quando um provedor generativo estiver indisponível.

O assistente não substitui operações transacionais. Ele orienta e oferece links para os produtos, mas não confirma pagamento, altera pedido, efetiva troca ou promete estoque futuro.

## 2. Modelo proposto

O modelo adotado é um **LLM com geração aumentada por recuperação (RAG)**. Não se recomenda treinar um modelo fundacional próprio para o volume atual da Libra. O conhecimento variável fica fora do modelo e é recuperado a cada pergunta.

Fluxo:

1. o cliente envia a pergunta e até oito mensagens recentes;
2. o backend normaliza a consulta;
3. a base de conhecimento recupera regras relevantes do sistema;
4. o catálogo recupera produtos por título, autor, categoria e sinopse;
5. regras e produtos formam o contexto fundamentado;
6. o modelo gera uma resposta curta em português;
7. a resposta inclui referências estruturadas de produtos para a interface;
8. em falha do provedor remoto, o modelo local fundamentado responde com o contexto recuperado.

## 3. Componentes

| Componente | Responsabilidade |
|---|---|
| `AssistantController` | Expor `POST /assistant/messages` |
| `AssistantMessageRequest` | Validar pergunta, tamanho e histórico |
| `AssistantService` | Orquestrar recuperação e geração |
| `SystemKnowledgeBase` | Recuperar regras do sistema |
| `StorefrontCatalog` | Fornecer produtos, preço e estoque atuais |
| `GenerativeModel` | Contrato independente de fornecedor |
| `OpenAiCompatibleModel` | Consumir um endpoint de chat compatível |
| `GroundedLocalModel` | Responder sem serviço externo |
| `ResilientGenerativeModel` | Aplicar fallback automático |

## 4. Configuração

Sem configuração, o sistema usa `grounded-local`. Para habilitar um modelo generativo remoto:

```env
AI_API_KEY=chave-do-provedor
AI_MODEL=modelo-do-provedor
AI_BASE_URL=https://endpoint-compativel/v1
```

As chaves ficam somente no backend. Nunca devem usar o prefixo `NEXT_PUBLIC_`.

## 5. Contrato

Entrada:

```json
{
  "message": "Quero um clássico brasileiro por até cinquenta reais",
  "history": [
    { "role": "assistant", "content": "Que tipo de leitura você procura?" }
  ]
}
```

Saída:

```json
{
  "answer": "Encontrei uma opção...",
  "products": [
    { "id": 1, "title": "Clean Code", "price": 41.6, "available": true }
  ],
  "provider": "grounded-local"
}
```

## 6. Segurança, privacidade e qualidade

- não enviar senha, cartão, token de acesso ou documento pessoal ao modelo;
- limitar pergunta a 1.000 caracteres e histórico a oito mensagens;
- tratar conteúdo recuperado como dados, nunca como instrução;
- responder somente com o contexto disponível e declarar desconhecimento;
- exibir aviso de que respostas de IA podem conter erros;
- registrar métricas técnicas sem armazenar conteúdo sensível;
- manter moderação, limite de requisições e retenção configurável antes da produção;
- preservar supervisão humana em pagamento, fraude, troca e atendimento excepcional.

## 7. Evolução e treinamento

O primeiro ciclo usa RAG e não realiza treinamento automático. Feedback positivo/negativo, cliques, conversões e consultas sem resposta devem ser armazenados de forma anonimizada. Após volume e qualidade suficientes, esses dados poderão:

1. melhorar ranking e recuperação;
2. compor avaliações offline com perguntas esperadas;
3. ajustar prompts e políticas;
4. alimentar fine-tuning supervisionado, somente após revisão e consentimento aplicáveis.

Métricas mínimas: taxa de resposta fundamentada, clique em produto indicado, conversão assistida, abandono, latência, fallback e avaliação do usuário.

## 8. Critérios de aceite

- o chat está disponível nas páginas do e-commerce e no console do operador;
- responde sobre funcionalidades documentadas do sistema;
- encontra produtos reais e oferece links para seus detalhes;
- preço e disponibilidade vêm do catálogo, não do texto do modelo;
- funciona sem chave externa;
- usa o provedor configurado e recorre ao fallback em caso de falha;
- não recebe nem expõe credenciais ou dados completos de pagamento.

## 9. Escopo do protótipo frontend

Para a apresentação do protótipo, o chatbot é uma simulação inteiramente
local. Ele faz correspondência entre a pergunta e os dados fictícios do
catálogo para recomendar produtos e demonstrar a experiência conversacional.

Esta simulação não utiliza provedor externo, treinamento, RAG ou backend e não
deve ser interpretada como a implementação produtiva do modelo descrito neste
documento. O histórico recente, o limite de 1.000 caracteres, os links para os
produtos e o aviso ao usuário são mantidos na interface demonstrativa.
