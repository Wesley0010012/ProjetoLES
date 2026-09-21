import { Book } from 'src/books/domain/entities/Book';
import {
  AbstractEntity,
  AbstractEntityProps,
} from 'src/shared/domain/entities/AbstractEntity';

export type StockBalanceProps = AbstractEntityProps & {
  book: Book;
  availableQuantity: number;
  blockedQuantity?: number;
};

export class StockBalance extends AbstractEntity<StockBalanceProps> {
  public get book(): Book {
    return this._props.book;
  }

  public get availableQuantity(): number {
    return this._props.availableQuantity;
  }

  public get blockedQuantity(): number {
    return this._props.blockedQuantity ?? 0;
  }

  public add(quantity: number): void {
    this._props.availableQuantity += quantity;
    this.touch();
  }

  public remove(quantity: number): void {
    this._props.availableQuantity -= quantity;
    this.touch();
  }

  public canRemove(quantity: number): boolean {
    return quantity > 0 && quantity <= this.availableQuantity;
  }

  public block(quantity: number): void {
    if (!this.canRemove(quantity)) {
      throw new RangeError('insufficient available stock');
    }
    this._props.availableQuantity -= quantity;
    this._props.blockedQuantity = this.blockedQuantity + quantity;
    this.touch();
  }

  public unblock(quantity: number): void {
    if (quantity <= 0 || quantity > this.blockedQuantity) {
      throw new RangeError('invalid blocked stock quantity');
    }
    this._props.blockedQuantity = this.blockedQuantity - quantity;
    this._props.availableQuantity += quantity;
    this.touch();
  }

  public commitBlocked(quantity: number): void {
    if (quantity <= 0 || quantity > this.blockedQuantity) {
      throw new RangeError('invalid blocked stock quantity');
    }
    this._props.blockedQuantity = this.blockedQuantity - quantity;
    this.touch();
  }
}
