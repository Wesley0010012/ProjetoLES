export class PasswordStrengthRule {
  public requirements(password: string) {
    return [
      { label: "8 caracteres", valid: password.length >= 8 },
      { label: "Letra maiúscula", valid: /[A-Z]/.test(password) },
      { label: "Letra minúscula", valid: /[a-z]/.test(password) },
      { label: "Caractere especial", valid: /[^A-Za-z0-9]/.test(password) },
    ];
  }
  public validate(password: string): void {
    if (!this.requirements(password).every((rule) => rule.valid)) {
      throw new Error(
        "A senha deve ter ao menos 8 caracteres, incluindo letra maiúscula, minúscula e caractere especial.",
      );
    }
  }
}
