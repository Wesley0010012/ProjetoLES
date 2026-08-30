import { clearAuthentication } from "@/data/auth/clear-authentication";

export function redirectOnAuthenticationError(response: Response): void {
  if (response.status !== 401 && response.status !== 403) {
    return;
  }

  clearAuthentication();
  window.location.replace(
    window.location.pathname.startsWith("/admin") ? "/admin/login" : "/login",
  );
}
