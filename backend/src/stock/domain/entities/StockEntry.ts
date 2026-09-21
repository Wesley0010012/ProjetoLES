import { Book } from 'src/books/domain/entities/Book';
import {
  AbstractEntity,
  AbstractEntityProps,
} from 'src/shared/domain/entities/AbstractEntity';
import { Supplier } from './Supplier';

export type StockEntryProps = AbstractEntityProps & {
  book: Book;
  quantity: number;
  unitCost: number;
  supplier: Supplier;
  entryDate: Date;
};

export class StockEntry extends AbstractEntity<StockEntryProps> {
  public get book(): Book {
    return this._props.book;
  }

  public get quantity(): number {
    return this._props.quantity;
  }

  public get unitCost(): number {
    return this._props.unitCost;
  }

  public get supplier(): Supplier {
    return this._props.supplier;
  }

  public get entryDate(): Date {
    return this._props.entryDate;
  }
}
