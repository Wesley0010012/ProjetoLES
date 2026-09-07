import { PasswordUsedBeforeRule } from "@/domain/rules/password-used-before-rule";
import { validatePassword } from "@/domain/rules/validate-password";

// Prototype data only, kept in memory like the backend's in-memory repository.
const passwords = new Map<string, string[]>([
  ["henry.townshend@libra.com.br", ["Cliente@123"]],
  ["operador@libra.com.br", ["Operador@123"]],
]);

export function updateMockPassword(
  email: string,
  password: string,
  confirmation: string,
): void {
  validatePassword(password, confirmation);
  const key = email.trim().toLowerCase();
  const history = passwords.get(key) ?? [];
  new PasswordUsedBeforeRule().validate(password, history);
  passwords.set(key, [password, ...history].slice(0, 3));
}
