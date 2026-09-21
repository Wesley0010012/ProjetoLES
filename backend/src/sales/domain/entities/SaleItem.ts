import { Book } from 'src/books/domain/entities/Book';

export class SaleItem {
  public constructor(
    private readonly _book: Book,
    private readonly _quantity: number,
    private readonly _unitPrice: number,
  ) {}

  public get book(): Book {
    return this._book;
  }

  public get quantity(): number {
    return this._quantity;
  }

  public get unitPrice(): number {
    return this._unitPrice;
  }

  public get total(): number {
    return Math.round(this.quantity * this.unitPrice * 100) / 100;
  }
}
