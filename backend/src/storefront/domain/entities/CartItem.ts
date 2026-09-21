import { Book } from 'src/books/domain/entities/Book';

// Trocar por uma Entidade AbstractEntity<>
// Chamar de ShoppingCartItem
export class CartItem {
  public constructor(
    private readonly _book: Book,
    private _quantity: number,
    private readonly _unitPrice: number,
  ) {}

  public get book(): Book {
    return this._book;
  }
  public get quantity(): number {
    return this._quantity;
  }

  public set quantity(value: number) {
    this._quantity = value;
  }

  public get unitPrice(): number {
    return this._unitPrice;
  }

  public get total(): number {
    return Math.round(this.quantity * this._book.defaultPrice * 100) / 100;
  }
}
