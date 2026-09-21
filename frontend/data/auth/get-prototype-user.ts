import { getAuthenticationSession } from "@/data/http/get-authentication-token";
export async function getPrototypeUser(type: "USER" | "OPERATOR" = "USER") {
  const session = await getAuthenticationSession(type);
  return { key: session.email, userId: session.userId };
}
