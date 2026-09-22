# Frontend Libra

Para executar toda a aplicação com Nginx e Docker, veja o [README da raiz](../README.md).

Execute `npm run start:dev` em `backend` e `npm run dev` em `frontend`.
A API usa a porta 3001 e o frontend a porta 3000. `NEXT_PUBLIC_API_URL` define a API; `FRONTEND_ORIGIN` define a origem permitida no backend.

Todas as operações acessam o backend. O acesso direto a `/admin` e `/customer` inicia automaticamente uma sessão de demonstração para o operador (ID 2) ou Henry (ID 1), em sessões separadas. Esse acesso fixo é parte do ambiente de demonstração. O cadastro em `/sign-up` cria uma conta no backend e mantém sua sessão durante o preenchimento do perfil.

O cliente usa `/users/:userId/customer` e `/customer/*`; o operador usa `/admin/*`. Não há criação de clientes pelo admin nem manutenção de livros, autores, categorias, editoras ou grupos de precificação. Esses dados permanecem como dependências dos fluxos.

As 100 capas estão em `public/images/books` e são servidas em `/images/books/...`, com cache de um dia e sem otimização remota. Os metadados de origem foram preservados no catálogo inicial do backend.

Os repositórios do backend são em memória: reiniciar o processo restaura os dados iniciais. Validação e autorização de cartões usam adaptadores locais de demonstração; não processam cobranças reais. O assistente usa o catálogo do backend e o modelo local; a integração de IA externa é opcional.

Verificações: `npm run build` nos dois projetos e `npm run test:e2e` no backend.
