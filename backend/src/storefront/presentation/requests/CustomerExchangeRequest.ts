import { MessageKeyEnum } from 'src/shared/domain/enums/MessageKeyEnum';
import { BadRequest } from 'src/shared/domain/errors/BadRequest';
import { Request } from 'src/shared/presentation/requests/Request';
import { ExchangeInput } from '../../application/ShoppingInputs';

export class CustomerExchangeRequest extends Request {
  public readonly input: ExchangeInput;

  public constructor(data: unknown) {
    super(data);
    const rawItems = this.required('items');
    if (!Array.isArray(rawItems) || rawItems.length === 0) {
      this.invalid('items');
    }
    const items = rawItems.map((value) => {
      if (typeof value !== 'object' || value === null) {
        this.invalid('items');
      }
      const item = value as Record<string, unknown>;
      const bookId = Number(item.bookId);
      const quantity = Number(item.quantity);
      if (
        !Number.isInteger(bookId) ||
        bookId <= 0 ||
        !Number.isInteger(quantity) ||
        quantity <= 0
      ) {
        this.invalid('items');
      }
      return { bookId, quantity };
    });
    if (new Set(items.map((item) => item.bookId)).size !== items.length)
      this.invalid('items');
    this.input = {
      reason: this.string('reason'),
      saleId: this.positiveInteger('saleId'),
      items,
    };
  }

  private invalid(param: string): never {
    throw new BadRequest(MessageKeyEnum.INVALID_PARAM, { param });
  }
}
