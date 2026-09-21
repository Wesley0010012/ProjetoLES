import { clearAuthenticationCookie } from "./authentication-cookie";

export function clearAuthentication(): void {
  sessionStorage.removeItem("libra.authentication");
  sessionStorage.removeItem("libra.authentication.USER");
  sessionStorage.removeItem("libra.authentication.OPERATOR");
  localStorage.removeItem("libra.authentication");
  clearAuthenticationCookie();
}
