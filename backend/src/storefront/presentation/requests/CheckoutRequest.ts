import { MessageKeyEnum } from 'src/shared/domain/enums/MessageKeyEnum';
import { BadRequest } from 'src/shared/domain/errors/BadRequest';
import { Request } from 'src/shared/presentation/requests/Request';
import { CheckoutInput } from '../../application/ShoppingInputs';

export class CheckoutRequest extends Request {
  public readonly input: CheckoutInput;

  public constructor(data: unknown) {
    super(data);
    const rawPayments = this.required('cardPayments');
    const rawCoupons = this.required('couponCodes');
    if (!Array.isArray(rawPayments) || !Array.isArray(rawCoupons)) {
      throw new BadRequest(MessageKeyEnum.INVALID_PARAM, { param: 'payment' });
    }
    const cardPayments = rawPayments.map((value) => {
      if (typeof value !== 'object' || value === null) {
        this.invalid('cardPayments');
      }
      const payment = value as Record<string, unknown>;
      const cardId = Number(payment.cardId);
      const amount = Number(payment.amount);
      if (
        !Number.isInteger(cardId) ||
        cardId <= 0 ||
        !Number.isFinite(amount) ||
        amount <= 0
      ) {
        this.invalid('cardPayments');
      }
      return { cardId, amount };
    });
    if (!rawCoupons.every((value) => typeof value === 'string')) {
      this.invalid('couponCodes');
    }
    this.input = {
      addressId: this.positiveInteger('addressId'),
      cardPayments,
      couponCodes: rawCoupons as string[],
    };
  }

  private invalid(param: string): never {
    throw new BadRequest(MessageKeyEnum.INVALID_PARAM, { param });
  }
}
