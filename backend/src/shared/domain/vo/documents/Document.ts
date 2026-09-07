export abstract class Document {
  private _number: string;

  public constructor(number: string) {
    this._number = this.normalize(number);
  }

  public get number(): string {
    return this._number;
  }

  public set number(number: string) {
    this._number = this.normalize(number);
  }

  protected normalize(number: string): string {
    const normalized = number.replace(/\D/g, '');
    if (normalized.length === 0) {
      throw new TypeError('document number is required');
    }
    return normalized;
  }
}
