export interface Validator {
  validate(plaintext: string, encryptedText: string): Promise<boolean>;
}
