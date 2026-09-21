import {
  AbstractEntity,
  AbstractEntityProps,
} from 'src/shared/domain/entities/AbstractEntity';
import { CreditCardBrand } from '../enums/CreditCardBrand';
import { Customer } from './Customer';

export type CustomerCreditCardProps = AbstractEntityProps & {
  customer: Customer;
  lastFourDigits: string;
  printedName: string;
  brand: CreditCardBrand;
  gatewayToken: string;
  preferred: boolean;
  description?: string;
};

export class CustomerCreditCard extends AbstractEntity<CustomerCreditCardProps> {
  public get description(): string | undefined {
    return this._props.description;
  }
  public set description(value: string | undefined) {
    this._props.description = value;
  }
  public get customer(): Customer {
    return this._props.customer;
  }
  public get lastFourDigits(): string {
    return this._props.lastFourDigits;
  }
  public get printedName(): string {
    return this._props.printedName;
  }
  public set printedName(value: string) {
    this._props.printedName = value;
  }
  public get brand(): CreditCardBrand {
    return this._props.brand;
  }
  public set brand(value: CreditCardBrand) {
    this._props.brand = value;
  }
  public get gatewayToken(): string {
    return this._props.gatewayToken;
  }
  public get preferred(): boolean {
    return this._props.preferred;
  }
  public set preferred(value: boolean) {
    this._props.preferred = value;
  }
}
