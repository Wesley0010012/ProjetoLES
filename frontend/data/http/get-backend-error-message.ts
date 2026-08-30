type BackendErrorResponse = {
  message?: unknown;
};

export async function getBackendErrorMessage(
  response: Response,
  fallbackMessage: string,
): Promise<string> {
  try {
    const error = (await response.json()) as BackendErrorResponse;

    return typeof error.message === "string" && error.message.trim()
      ? error.message
      : fallbackMessage;
  } catch {
    return fallbackMessage;
  }
}
