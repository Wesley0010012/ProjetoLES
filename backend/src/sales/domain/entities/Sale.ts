import { Customer } from 'src/customers/domain/entities/Customer';
import {
  AbstractEntity,
  AbstractEntityProps,
} from 'src/shared/domain/entities/AbstractEntity';
import { SaleStatus } from '../enums/SaleStatus';
import { SaleItem } from './SaleItem';

export type SaleProps = AbstractEntityProps & {
  discount?: number;
  deliveryAddress?: {
    name: string;
    street: string;
    number: string;
    city: string;
    state: string;
  };
  coupons?: string[];
  payments?: {
    cardId: number;
    brand: string;
    lastFourDigits: string;
    amount: number;
  }[];
  code: string;
  customer: Customer;
  items: SaleItem[];
  status: SaleStatus;
  saleDate: Date;
  freight: number;
};

export class Sale extends AbstractEntity<SaleProps> {
  public get discount(): number {
    return this._props.discount ?? 0;
  }
  public get deliveryAddress() {
    return this._props.deliveryAddress;
  }
  public get coupons() {
    return this._props.coupons ?? [];
  }
  public get payments() {
    return this._props.payments ?? [];
  }
  public get subtotal() {
    return this.items.reduce((sum, item) => sum + item.total, 0);
  }
  public get code(): string {
    return this._props.code;
  }

  public get customer(): Customer {
    return this._props.customer;
  }

  public get items(): SaleItem[] {
    return [...this._props.items];
  }

  public get status(): SaleStatus {
    return this._props.status;
  }

  public set status(status: SaleStatus) {
    this._props.status = status;
    this.touch();
  }

  public get saleDate(): Date {
    return this._props.saleDate;
  }

  public get freight(): number {
    return this._props.freight;
  }

  public get total(): number {
    return (
      Math.round(
        (this.items.reduce((sum, item) => sum + item.total, 0) +
          this.freight -
          this.discount) *
          100,
      ) / 100
    );
  }
}
