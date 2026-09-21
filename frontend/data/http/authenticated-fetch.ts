import {
  getAuthenticationToken,
  invalidateAuthenticationToken,
} from "./get-authentication-token";
export async function authenticatedFetch(
  url: string,
  init: RequestInit = {},
  type: "USER" | "OPERATOR" = "OPERATOR",
): Promise<Response> {
  const send = async (token: string) => {
    const headers = new Headers(init.headers);
    headers.set("Authorization", `Bearer ${token}`);
    return fetch(url, { ...init, headers });
  };
  const token = await getAuthenticationToken(type);
  let response = await send(token);
  if (response.status === 401) {
    invalidateAuthenticationToken(token);
    response = await send(await getAuthenticationToken(type));
  }
  return response;
}
