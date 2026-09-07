import { AuthenticatedPrincipal, AuthorizationPolicy } from './Authentication';

export class RoleAuthorizationPolicy implements AuthorizationPolicy {
  public allows(
    principal: AuthenticatedPrincipal,
    requiredRoles: readonly string[],
  ): boolean {
    return requiredRoles.every((role) => principal.roles.includes(role));
  }
}
