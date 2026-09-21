import { authenticatedFetch } from "./authenticated-fetch";
import { getBackendErrorMessage } from "./get-backend-error-message";

type RequestOptions = {
  role?: "USER" | "OPERATOR" | null;
  errorMessage?: string;
};

export async function requestJson<T>(
  url: string,
  init: RequestInit = {},
  {
    role = "OPERATOR",
    errorMessage = "Não foi possível concluir a operação.",
  }: RequestOptions = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const options = { ...init, headers };
  const response =
    role === null
      ? await fetch(url, options)
      : await authenticatedFetch(url, options, role);
  if (!response.ok) {
    throw new Error(await getBackendErrorMessage(response, errorMessage));
  }
  return response.status === 204 ? (undefined as T) : ((await response.json()) as T);
}
