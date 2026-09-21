import { Customer } from 'src/customers/domain/entities/Customer';
import {
  AbstractEntity,
  AbstractEntityProps,
} from 'src/shared/domain/entities/AbstractEntity';
import { CartItem } from './CartItem';


export type ShoppingCartProps = AbstractEntityProps & {
  customer: Customer;
  items: CartItem[];
  lastItemAddedAt?: Date;
};

export class ShoppingCart extends AbstractEntity<ShoppingCartProps> {
  public get customer(): Customer {
    return this._props.customer;
  }

  public get items(): CartItem[] {
    return [...this._props.items];
  }

  public set items(value: CartItem[]) {
    this._props.items = [...value];
  }

  public get lastItemAddedAt(): Date | undefined {
    return this._props.lastItemAddedAt;
  }

  public set lastItemAddedAt(value: Date | undefined) {
    this._props.lastItemAddedAt = value;
  }

  public get subtotal(): number {
    return (
      Math.round(this.items.reduce((sum, item) => sum + item.total, 0) * 100) /
      100
    );
  }
}
