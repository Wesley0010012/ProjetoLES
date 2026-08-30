import type { Authentication } from "@/domain/models/authentication";
import type { AccessType } from "@/domain/models/access-type";

export const authenticationCookieName = "libra.authentication";

export function setAuthenticationCookie(
  authentication: Authentication,
  type: AccessType,
  persistent: boolean,
): void {
  const value = encodeURIComponent(
    JSON.stringify({
      token: authentication.token,
      expiresAt: authentication.expiresAt.toISOString(),
      type,
    }),
  );
  const attributes = [
    `${authenticationCookieName}=${value}`,
    "path=/",
    "SameSite=Strict",
    ...(persistent ? [`expires=${authentication.expiresAt.toUTCString()}`] : []),
    ...(window.location.protocol === "https:" ? ["Secure"] : []),
  ];

  document.cookie = attributes.join("; ");
}

export function clearAuthenticationCookie(): void {
  document.cookie = [
    `${authenticationCookieName}=`,
    "path=/",
    "expires=Thu, 01 Jan 1970 00:00:00 GMT",
    "SameSite=Strict",
  ].join("; ");
}
