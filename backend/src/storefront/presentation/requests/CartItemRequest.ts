import { Request } from 'src/shared/presentation/requests/Request';

export class CartItemRequest extends Request {
  public readonly bookId: number;
  public readonly quantity: number;

  public constructor(data: unknown) {
    super(data);
    this.bookId = this.positiveInteger('bookId');
    this.quantity = this.positiveInteger('quantity');
  }
}
