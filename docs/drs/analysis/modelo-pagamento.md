# Modelo de integração de pagamentos

## Objetivo

Este documento complementa o DRS com um modelo de pagamento semelhante ao
utilizado por gateways do mercado. Ele cobre somente a comunicação entre a
Libra e a operadora. Cupons promocionais e de troca continuam sendo validados
internamente pela Libra; o gateway recebe apenas o valor restante a cobrar.

O modelo suporta uma ou mais cobranças em cartão para a mesma compra, conforme
o requisito RN0034. Valores monetários são sempre inteiros na menor unidade da
moeda. Assim, `1050` em `BRL` representa R$ 10,50.

## Segurança

- A Libra deve enviar `X-API-Key` em toda chamada.
- Dados completos de cartão e CVV nunca devem ser enviados ou armazenados.
- Cada cartão deve ser representado por um token produzido por um provedor
  compatível com PCI DSS.
- Toda criação de pagamento deve conter `Idempotency-Key`.
- Em produção, toda comunicação deve utilizar HTTPS.
- Logs devem omitir tokens, segredos e dados pessoais.

O mock usa a chave `local-secret` por padrão. Ela serve apenas para
desenvolvimento.

## Estados

| Estado | Significado |
|---|---|
| `AUTHORIZED` | Limite reservado, aguardando captura |
| `PAID` | Cobranças capturadas |
| `DECLINED` | Pagamento recusado sem captura |
| `CANCELED` | Autorização cancelada |
| `PARTIALLY_REFUNDED` | Parte do valor capturado foi estornada |
| `REFUNDED` | Todo o valor capturado foi estornado |

Fluxo principal:

```text
AUTHORIZED -> PAID -> PARTIALLY_REFUNDED -> REFUNDED
     |
     +------> CANCELED

Criação recusada -> DECLINED
```

## Criar pagamento

`POST /v1/payments`

Headers:

```text
X-API-Key: local-secret
Idempotency-Key: checkout-123-tentativa-1
Content-Type: application/json
```

Exemplo com captura imediata:

```json
{
  "merchant_order_id": "order-123",
  "amount": 5000,
  "currency": "BRL",
  "capture": true,
  "payment_methods": [
    {
      "type": "card",
      "token": "tok_approved",
      "amount": 3000,
      "installments": 1
    },
    {
      "type": "card",
      "token": "tok_approved",
      "amount": 2000,
      "installments": 1
    }
  ],
  "webhook_url": "http://localhost:3001/payments/webhook"
}
```

Regras:

- `amount` deve ser positivo.
- `currency` deve ser `BRL`.
- A soma de `payment_methods[].amount` deve ser igual a `amount`.
- Cada cartão deve receber no mínimo R$ 10,00, salvo quando a Libra tiver
  aplicado cupons e o saldo total restante for inferior a R$ 10,00.
- `installments` deve estar entre 1 e 12.
- Se `capture` for `false`, o resultado aprovado será `AUTHORIZED`.
- Se `capture` for `true`, o resultado aprovado será `PAID`.
- A mesma chave idempotente e o mesmo corpo devolvem o mesmo pagamento.
- Reutilizar a chave idempotente com outro corpo retorna `409`.
- A operação com vários cartões é atômica no mock: se um deles for recusado,
  nenhum valor é capturado.

Resposta:

```json
{
  "id": "pay_01...",
  "merchant_order_id": "order-123",
  "amount": 5000,
  "currency": "BRL",
  "status": "PAID",
  "captured_amount": 5000,
  "refunded_amount": 0,
  "decline_code": null,
  "payment_methods": [
    {
      "id": "chg_01...",
      "type": "card",
      "amount": 3000,
      "installments": 1,
      "status": "PAID"
    }
  ],
  "created_at": "2026-07-24T23:00:00Z",
  "updated_at": "2026-07-24T23:00:00Z"
}
```

## Consultar

- `GET /v1/payments/{payment_id}` consulta um pagamento.
- `GET /v1/payments` lista todos os pagamentos do mock.

## Capturar

`POST /v1/payments/{payment_id}/capture`

Somente pagamentos `AUTHORIZED` podem ser capturados. A captura integral muda
o estado para `PAID`.

## Cancelar

`POST /v1/payments/{payment_id}/cancel`

Somente uma autorização ainda não capturada pode ser cancelada.

## Estornar

`POST /v1/payments/{payment_id}/refund`

```json
{
  "amount": 1500
}
```

O campo `amount` é opcional; quando ausente, estorna todo o saldo capturado.
O valor acumulado dos estornos nunca pode superar o valor capturado.

## Webhooks

Cada mudança gera um evento:

```json
{
  "id": "evt_01...",
  "type": "payment.paid",
  "created_at": "2026-07-24T23:00:00Z",
  "data": {
    "payment_id": "pay_01...",
    "merchant_order_id": "order-123",
    "status": "PAID"
  }
}
```

Quando `webhook_url` for informado, o mock envia o evento por `POST`. O header
`X-Mock-Signature` contém um HMAC-SHA256 do corpo usando
`PAYMENT_MOCK_WEBHOOK_SECRET`. A aplicação deve validar a assinatura e tratar
eventos repetidos de forma idempotente.

Para testes, `GET /v1/events` permite consultar os eventos produzidos.

## Tokens de teste

| Token | Resultado |
|---|---|
| `tok_approved` | Aprovação |
| `tok_declined` | Recusa genérica |
| `tok_insufficient_funds` | Saldo insuficiente |
| `tok_expired` | Cartão expirado |

Qualquer token diferente dos tokens de teste é considerado inválido.

## Relação com a compra

- Ao iniciar a cobrança, a compra permanece `EM PROCESSAMENTO`.
- `PAID` permite que a Libra altere a compra para `APROVADA`.
- `DECLINED` permite alterar a compra para `REPROVADA`.
- Estoque somente deve receber baixa após a confirmação de `PAID`.
- A resposta síncrona pode atualizar a compra, mas o webhook deve reconciliar
  o estado em caso de falha de comunicação.
