export class Email {
  private readonly _address: string;

  public constructor(address: string) {
    const normalized = address.trim().toLowerCase();
    if (
      normalized.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)
    ) {
      throw new TypeError('invalid email address');
    }
    this._address = normalized;
  }

  public get address(): string {
    return this._address;
  }
}
