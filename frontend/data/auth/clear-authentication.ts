import { clearAuthenticationCookie } from "./authentication-cookie";

export function clearAuthentication(): void {
  sessionStorage.removeItem("libra.authentication");
  sessionStorage.removeItem("libra.authentication.USER");
  sessionStorage.removeItem("libra.authentication.OPERATOR");
  localStorage.removeItem("libra.authentication");
  localStorage.removeItem("libra.authentication.USER");
  localStorage.removeItem("libra.authentication.OPERATOR");
  clearAuthenticationCookie();
}
