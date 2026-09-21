import { Book } from 'src/books/domain/entities/Book';
import {
  AbstractEntity,
  AbstractEntityProps,
} from 'src/shared/domain/entities/AbstractEntity';

export type BookSalePriceProps = AbstractEntityProps & {
  book: Book;
  costBasis: number;
  salePrice: number;
};

export class BookSalePrice extends AbstractEntity<BookSalePriceProps> {
  public get book(): Book {
    return this._props.book;
  }

  public get costBasis(): number {
    return this._props.costBasis;
  }

  public get salePrice(): number {
    return this._props.salePrice;
  }

  public recalculate(costBasis: number): void {
    this._props.costBasis = costBasis;
    this._props.salePrice = BookSalePrice.calculate(
      costBasis,
      this.book.precificationGroup.profitMarginPercentage,
    );
    this.touch();
  }

  public static calculate(
    costBasis: number,
    profitMarginPercentage: number,
  ): number {
    return (
      Math.round(costBasis * (1 + profitMarginPercentage / 100) * 100) / 100
    );
  }
}
