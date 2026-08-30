export function apiUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
}

export function isMockEnvironment(): boolean {
  return process.env.NEXT_PUBLIC_USE_MOCK !== "false";
}
