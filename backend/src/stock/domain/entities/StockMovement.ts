import { Book } from 'src/books/domain/entities/Book';
import {
  AbstractEntity,
  AbstractEntityProps,
} from 'src/shared/domain/entities/AbstractEntity';
import { StockMovementType } from '../enums/StockMovementType';

export type StockMovementProps = AbstractEntityProps & {
  book: Book;
  type: StockMovementType;
  quantity: number;
  occurredAt: Date;
};

export class StockMovement extends AbstractEntity<StockMovementProps> {
  public get book(): Book {
    return this._props.book;
  }

  public get type(): StockMovementType {
    return this._props.type;
  }

  public get quantity(): number {
    return this._props.quantity;
  }

  public get occurredAt(): Date {
    return this._props.occurredAt;
  }
}
