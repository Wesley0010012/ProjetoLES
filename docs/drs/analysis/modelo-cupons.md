# Análise e modelo unificado de cupons

## Lacuna identificada

O sistema tratava apenas o cupom de troca como entidade. O cupom promocional `LIBRA10` era reconhecido diretamente pelo código dentro do checkout, com desconto fixado na implementação. Isso impedia a criação administrativa de novas campanhas, duplicava regras e fazia o comportamento do cupom depender de condicionais específicas.

## Modelo adotado

`Coupon` passa a representar todo benefício aplicado no pagamento. A origem e finalidade são identificadas por `CouponType`:

| Tipo | Finalidade |
|---|---|
| `EXCHANGE` | Crédito devolvido ao cliente por troca ou sobra de outros cupons |
| `PROMOTIONAL` | Campanha criada pela operação para conceder desconto |

O desconto possui modalidade própria:

| Modalidade | Regra |
|---|---|
| `FIXED` | Valor monetário em reais |
| `PERCENTAGE` | Percentual calculado sobre o total da compra |

Principais atributos:

- `code`: código único, sem diferença entre maiúsculas e minúsculas;
- `type`: troca ou promocional;
- `discountType`: fixo ou percentual;
- `value`: valor em reais ou percentual, conforme a modalidade;
- `customer`: cliente proprietário, obrigatório para cupom de troca e opcional para promocional;
- `expiresAt`: validade opcional;
- `singleUse`: indica invalidação após uso;
- `used`: registra o consumo de um cupom de uso único;
- `active`: permite desativação administrativa.

## Regras

1. Cupons de troca são sempre de valor fixo, vinculados a um cliente e de uso único.
2. Cupons promocionais podem ser fixos ou percentuais, globais ou vinculados a um cliente.
3. Percentuais devem ser maiores que zero e limitados a 100%.
4. Código informado pelo operador deve ser único. Quando omitido, o sistema gera `PROMO-NNNNNN` ou `TROCA-NNNNNN`.
5. Cupom vencido, inativo, consumido ou pertencente a outro cliente é inválido.
6. Apenas um cupom promocional pode ser aplicado por compra, conforme RN0033.
7. Vários cupons de troca podem ser combinados, respeitando a regra que impede excesso desnecessário.
8. Se cupons válidos superarem o total necessário, a sobra retorna como novo cupom de troca.
9. Cupons somente são consumidos depois da aprovação do pagamento.
10. A desativação é lógica e preserva o histórico.

## Fluxos de criação

### Troca

O recebimento de uma troca autorizada ou uma sobra no checkout cria automaticamente um `Coupon` do tipo `EXCHANGE`.

### Criação administrativa

O operador pode listar, criar e desativar cupons na aba **Vendas e trocas > Cupons**:

- `GET /operation/sales/coupons`;
- `POST /operation/sales/coupons`;
- `DELETE /operation/sales/coupons/:id`.

Exemplo de campanha:

```json
{
  "code": "FERIAS15",
  "type": "PROMOTIONAL",
  "discountType": "PERCENTAGE",
  "value": 15,
  "expiresAt": "2026-12-31",
  "singleUse": false
}
```

Exemplo de crédito individual:

```json
{
  "type": "EXCHANGE",
  "discountType": "FIXED",
  "value": 42.9,
  "customerId": 3,
  "singleUse": true
}
```

## Compatibilidade

`LIBRA10` agora é um cupom promocional semeado no repositório, percentual de 10% e reutilizável. O checkout não contém mais tratamento especial para esse código. Cupons de troca já existentes continuam com a mesma finalidade, mas utilizam a entidade unificada.
