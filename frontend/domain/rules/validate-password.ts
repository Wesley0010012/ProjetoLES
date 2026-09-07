import { PasswordStrengthRule } from "./password-strength-rule";
import { PasswordConfirmationRule } from "./password-confirmation-rule";

export function validatePassword(password: string, confirmation: string): void {
  new PasswordConfirmationRule().validate(password, confirmation);
  new PasswordStrengthRule().validate(password);
}
