import { Customer } from 'src/customers/domain/entities/Customer';
import {
  AbstractEntity,
  AbstractEntityProps,
} from 'src/shared/domain/entities/AbstractEntity';
import { CouponDiscountType } from '../enums/CouponDiscountType';
import { CouponType } from '../enums/CouponType';

export type CouponProps = AbstractEntityProps & {
  code: string;
  type: CouponType;
  discountType: CouponDiscountType;
  value: number;
  customer?: Customer;
  expiresAt?: Date;
  singleUse: boolean;
  used: boolean;
};

export class Coupon extends AbstractEntity<CouponProps> {
  public get code(): string {
    return this._props.code;
  }

  public get type(): CouponType {
    return this._props.type;
  }

  public get discountType(): CouponDiscountType {
    return this._props.discountType;
  }

  public get value(): number {
    return this._props.value;
  }

  public get customer(): Customer | undefined {
    return this._props.customer;
  }

  public get expiresAt(): Date | undefined {
    return this._props.expiresAt;
  }

  public get singleUse(): boolean {
    return this._props.singleUse;
  }

  public get used(): boolean {
    return this._props.used;
  }

  public discountFor(total: number): number {
    const discount =
      this.discountType === CouponDiscountType.PERCENTAGE
        ? (total * this.value) / 100
        : this.value;
    return Math.round(discount * 100) / 100;
  }

  public canBeUsedBy(customerId: number, at: Date = new Date()): boolean {
    return (
      this.isActive() &&
      (!this.singleUse || !this.used) &&
      (!this.expiresAt || this.expiresAt.getTime() >= at.getTime()) &&
      (!this.customer || this.customer.id === customerId)
    );
  }

  public use(): void {
    if (this.singleUse) {
      this._props.used = true;
      this.touch();
    }
  }
}
