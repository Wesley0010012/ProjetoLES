type AccessType = "USER" | "OPERATOR";
type Session = {
  token: string;
  userId: number;
  email: string;
  type: AccessType;
  expiresAt: string;
};

const pending = new Map<AccessType, Promise<Session>>();

export function invalidateAuthenticationToken(token: string): void {
  const matches = (serialized: string | null): boolean => {
    if (!serialized) return false;
    try {
      return JSON.parse(serialized).token === token;
    } catch {
      return false;
    }
  };
  for (const storage of [sessionStorage, localStorage]) {
    for (const key of [
      "libra.authentication",
      "libra.authentication.USER",
      "libra.authentication.OPERATOR",
    ]) {
      if (matches(storage.getItem(key))) storage.removeItem(key);
    }
  }
  const cookie = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith("libra.authentication="));
  if (
    cookie &&
    matches(decodeURIComponent(cookie.slice("libra.authentication=".length)))
  ) {
    document.cookie = "libra.authentication=; path=/; Max-Age=0; SameSite=Strict";
  }
}

export async function getAuthenticationSession(
  type: AccessType = "USER",
): Promise<Session> {
  const storedSession = getStoredSession(type);
  if (storedSession) return storedSession;

  if (!pending.has(type)) {
    const promise = (async () => {
      const email =
        type === "OPERATOR" ? "operador@libra.com.br" : "henry.townshend@libra.com.br";
      const { apiUrl } = await import("@/main/connectors/runtime-environment");
      const response = await fetch(`${apiUrl()}/auth/demo-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
      if (!response.ok)
        throw new Error(
          "Não foi possível iniciar o acesso de demonstração. Verifique o backend.",
        );
      const session = { ...(await response.json()), email, type } as Session;
      saveSession(session, type, sessionStorage);
      return session;
    })().finally(() => pending.delete(type));
    pending.set(type, promise);
  }
  return pending.get(type)!;
}

export async function getAuthenticationToken(
  type: AccessType = "OPERATOR",
): Promise<string> {
  return (await getAuthenticationSession(type)).token;
}

function getStoredSession(type: AccessType): Session | null {
  const candidates = [
    readStorageSession(sessionStorage, `libra.authentication.${type}`, type),
    readStorageSession(localStorage, `libra.authentication.${type}`, type),
    readStorageSession(sessionStorage, "libra.authentication", type),
    readStorageSession(localStorage, "libra.authentication", type),
    readCookieSession(type),
  ];
  const session = candidates.find(Boolean) ?? null;
  if (session) saveSession(session, type, sessionStorage);
  return session;
}

function readStorageSession(
  storage: Storage,
  key: string,
  type: AccessType,
): Session | null {
  const serialized = storage.getItem(key);
  if (!serialized) return null;
  const session = parseSession(serialized, type);
  if (!session) storage.removeItem(key);
  return session;
}

function readCookieSession(type: AccessType): Session | null {
  const cookie = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith("libra.authentication="));
  if (!cookie) return null;
  const value = cookie.slice("libra.authentication=".length);
  return parseSession(decodeURIComponent(value), type);
}

function parseSession(serialized: string, type: AccessType): Session | null {
  try {
    const session = JSON.parse(serialized) as Partial<Session>;
    if (
      session.type === type &&
      typeof session.token === "string" &&
      typeof session.expiresAt === "string" &&
      new Date(session.expiresAt).getTime() > Date.now() + 60000
    ) {
      return {
        token: session.token,
        userId: Number(session.userId),
        email: String(session.email ?? ""),
        type,
        expiresAt: session.expiresAt,
      };
    }
  } catch {
    return null;
  }
  return null;
}

function saveSession(session: Session, type: AccessType, storage: Storage): void {
  const serialized = JSON.stringify(session);
  storage.setItem(`libra.authentication.${type}`, serialized);
  storage.setItem("libra.authentication", serialized);
}
