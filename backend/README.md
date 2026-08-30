# Final backend — fundação compartilhada

Este diretório contém exclusivamente o escopo dos oito cartões em andamento:
primitivas de domínio e Value Objects, contratos de repositório e transação,
CRUD compartilhado, busca/paginação/ordenação, erros e validação, contratos de
autenticação/autorização, persistência/codecs e tratamento HTTP.

Os módulos funcionais e qualquer integração com o frontend estão fora deste
recorte.

## Verificação

```bash
npm ci
npm test -- --runInBand
npm run build
```
