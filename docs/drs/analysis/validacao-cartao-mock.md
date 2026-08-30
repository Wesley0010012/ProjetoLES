# Dependência mock para validação de cartão

## Objetivo

O cadastro de cartão não deve gerar tokens internamente no caso de uso.
A validação e a tokenização pertencem ao gateway de cartões e são acessadas
por meio da abstração `CreditCardValidator`.

## Fluxo

1. A request faz apenas a validação estrutural dos campos.
2. `ManageCustomerProfiles` envia número, nome impresso, bandeira e código de
   segurança ao `CreditCardValidator`.
3. O adapter HTTP envia os dados ao serviço
   `dependencies/credit_card_validation_mock/server.py`.
4. O serviço mock valida o algoritmo de Luhn, compatibilidade da bandeira,
   nome impresso e tamanho do CVV.
5. Em caso válido, o serviço devolve um token opaco e os quatro últimos
   dígitos.
6. Somente o token, os quatro últimos dígitos, a bandeira e o nome são
   persistidos.
7. Número completo e CVV são descartados.

Configuração do backend:

```env
CARD_VALIDATION_URL=http://127.0.0.1:8082
CARD_VALIDATION_API_KEY=local-card-secret
```

## Cartões de teste

| Resultado | Número | Bandeira | CVV |
|---|---|---|---|
| Aprovado | `4242424242424242` | VISA | `123` |
| Aprovado | `5555555555554444` | MASTERCARD | `123` |
| Aprovado | `378282246310005` | AMERICAN_EXPRESS | `1234` |
| Válido, pagamento recusado | `4000000000000002` | VISA | `123` |

O último cartão é validado e tokenizado normalmente, mas seu token contém o
comportamento `declined`, permitindo testar a recusa no mock de pagamento.

## Evolução

`CreditCardValidationServiceAdapter` funciona como adapter HTTP. Uma integração real
precisa apenas apontar as variáveis para um serviço compatível ou substituir
esse adapter. O caso de uso e a entidade não precisam ser alterados.
