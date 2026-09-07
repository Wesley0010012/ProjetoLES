# Front-end Libra

## Executar com o backend

1. Em `backend`, execute `npm run start:dev` (porta 3001).
2. Em `frontend`, execute `npm run dev` (porta 3000).

`NEXT_PUBLIC_API_URL` configura a URL do backend (padrão `http://localhost:3001`). `FRONTEND_URL` no backend configura a origem permitida pelo CORS (padrão `http://localhost:3000`).

Cadastro e alteração de senha de usuários sempre chamam o backend, mesmo com `NEXT_PUBLIC_USE_MOCK=true`. O cadastro chama `POST /users`, define a senha via `PATCH /users/:id/password` e guarda o ID retornado na sessão mockada. A tela de alteração envia apenas `password` e `passwordConfirmation`, sem senha atual. As regras de força e confirmação dão retorno imediato no formulário; o histórico é validado pelo backend e seus erros aparecem na tela.

Login e logout continuam mockados. Os acessos de demonstração representam o cliente de ID 1 e o atendente de ID 2. Sessões antigas sem ID precisam de novo login. Os demais módulos continuam seguindo `NEXT_PUBLIC_USE_MOCK`.

Os dados do backend ficam em memória e são reiniciados com o processo. A senha alterada não muda as credenciais fixas do login de demonstração.

Validação: `npm run test:password`, `npm run lint`, `npm run build`.
