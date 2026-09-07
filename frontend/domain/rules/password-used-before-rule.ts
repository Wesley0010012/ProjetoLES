export class PasswordUsedBeforeRule {
  public validate(password: string, previousPasswords: readonly string[]): void {
    if (previousPasswords.slice(0, 3).includes(password)) {
      throw new Error("A nova senha não pode repetir nenhuma das três últimas senhas.");
    }
  }
}
