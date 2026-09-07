import { PhoneTypeEnum } from '../enums/PhoneTypeEnum';

export class Phone {
  private _type: PhoneTypeEnum;
  private _ddd: string;
  private _number: string;

  public constructor(type: PhoneTypeEnum, ddd: string, number: string) {
    this.assertType(type);
    this.assertDdd(ddd);
    this.assertNumber(number);
    this._type = type;
    this._ddd = ddd;
    this._number = number;
  }

  public get type(): PhoneTypeEnum {
    return this._type;
  }

  public set type(type: PhoneTypeEnum) {
    this.assertType(type);
    this._type = type;
  }

  public get ddd(): string {
    return this._ddd;
  }

  public set ddd(ddd: string) {
    this.assertDdd(ddd);
    this._ddd = ddd;
  }

  public get number(): string {
    return this._number;
  }

  public set number(number: string) {
    this.assertNumber(number);
    this._number = number;
  }

  public get formatted(): string {
    return `(${this._ddd}) ${this._number}`;
  }

  private assertType(type: PhoneTypeEnum): void {
    if (!Object.values(PhoneTypeEnum).includes(type)) {
      throw new TypeError('invalid phone type');
    }
  }

  private assertDdd(ddd: string): void {
    if (!/^[1-9]\d$/.test(ddd)) {
      throw new TypeError('invalid phone area code');
    }
  }

  private assertNumber(number: string): void {
    if (!/^\d{8,9}$/.test(number)) {
      throw new TypeError('invalid phone number');
    }
  }
}
