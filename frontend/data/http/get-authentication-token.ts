import { clearAuthentication } from "@/data/auth/clear-authentication";

export function getAuthenticationToken(
  expectedType: "USER" | "OPERATOR" = "OPERATOR",
): string {
  const serialized =
    sessionStorage.getItem("libra.authentication") ??
    localStorage.getItem("libra.authentication");

  if (!serialized) {
    redirectToLogin(expectedType);
    throw new Error("Sua sessão expirou. Entre novamente.");
  }

  const authentication = JSON.parse(serialized) as {
    token?: string;
    type?: string;
  };

  if (!authentication.token || authentication.type !== expectedType) {
    redirectToLogin(expectedType);
    throw new Error("Este acesso não corresponde ao tipo da sua conta.");
  }

  return authentication.token;
}

function redirectToLogin(type: "USER" | "OPERATOR"): void {
  clearAuthentication();
  window.location.replace(type === "OPERATOR" ? "/admin/login" : "/login");
}
