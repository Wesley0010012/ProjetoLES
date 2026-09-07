export function getPrototypeUser(): { key: string; userId?: number } {
  const serialized =
    sessionStorage.getItem("libra.authentication") ??
    localStorage.getItem("libra.authentication");
  if (!serialized) throw new Error("Entre na conta para alterar sua senha.");
  const session = JSON.parse(serialized) as {
    email?: string;
    userId?: number;
    token?: string;
    type?: string;
  };
  if (!session.token) throw new Error("Entre na conta para alterar sua senha.");
  const userId = session.userId;
  const key =
    session.email?.trim().toLowerCase() ??
    (userId === 2
      ? "operador@libra.com.br"
      : userId === 1
        ? "henry.townshend@libra.com.br"
        : undefined);
  if (!key) throw new Error("Entre novamente para identificar sua conta.");
  return { key, userId };
}
