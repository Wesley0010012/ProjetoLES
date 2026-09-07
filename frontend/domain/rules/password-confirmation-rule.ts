export class PasswordConfirmationRule {
  public validate(password: string, confirmation: string): void {
    if (password !== confirmation)
      throw new Error("A senha e a confirmação devem ser iguais.");
  }
}
