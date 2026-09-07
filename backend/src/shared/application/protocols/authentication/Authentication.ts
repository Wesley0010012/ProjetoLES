export type AccessRole = string;

export type AuthenticatedPrincipal = Readonly<{
  userId: number;
  roles: readonly AccessRole[];
}>;

export interface AuthenticationTokenService {
  issue(principal: AuthenticatedPrincipal, expiresAt: Date): Promise<string>;
  verify(token: string): Promise<AuthenticatedPrincipal | null>;
  revoke(token: string): Promise<void>;
}

export interface AuthorizationPolicy {
  allows(
    principal: AuthenticatedPrincipal,
    requiredRoles: readonly AccessRole[],
  ): boolean;
}
