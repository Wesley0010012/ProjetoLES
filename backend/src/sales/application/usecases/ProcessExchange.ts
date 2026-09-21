import { MessageKeyEnum } from 'src/shared/domain/enums/MessageKeyEnum';
import { BadRequest } from 'src/shared/domain/errors/BadRequest';
import { FindRequiredEntity } from 'src/shared/application/usecases/FindRequiredEntity';
import { Coupon } from 'src/sales/domain/entities/Coupon';
import { CouponDiscountType } from 'src/sales/domain/enums/CouponDiscountType';
import { CouponType } from 'src/sales/domain/enums/CouponType';
import { ExchangeStatus } from 'src/sales/domain/enums/ExchangeStatus';
import { CouponRepository } from 'src/sales/domain/repositories/CouponRepository';
import { ExchangeRequestRepository } from 'src/sales/domain/repositories/ExchangeRequestRepository';
import { ReenterStock } from 'src/stock/application/usecases/ReenterStock';
import { StockQuantityInput } from 'src/stock/application/dto/StockQuantityInput';

export type ExchangeDecision =
  | { status: ExchangeStatus.REJECTED; observation?: string }
  | {
      status: ExchangeStatus.RECEIVED;
      returnToStock: boolean;
      receivedAt: Date;
    };

export class ProcessExchange {
  public constructor(
    private readonly _exchanges: ExchangeRequestRepository,
    private readonly _coupons: CouponRepository,
    private readonly _reenterStock: ReenterStock,
  ) {}

  public async execute(id: number, decision: ExchangeDecision) {
    const exchange = await new FindRequiredEntity(this._exchanges).execute(id);
    const expectedStatus =
      decision.status === ExchangeStatus.REJECTED
        ? ExchangeStatus.REQUESTED
        : ExchangeStatus.ARRIVED;
    if (exchange.status !== expectedStatus) {
      throw new BadRequest(MessageKeyEnum.INVALID_PARAM, { param: 'status' });
    }

    if (decision.status === ExchangeStatus.REJECTED) {
      exchange.reject(decision.observation ?? '');
      await this._exchanges.update(exchange);
      return;
    }

    const { returnToStock, receivedAt } = decision;
    if (returnToStock) {
      for (const item of exchange.items) {
        await this._reenterStock.execute(
          new StockQuantityInput(item.book.id, item.quantity, receivedAt),
        );
      }
    }

    const coupon = new Coupon({
      code: this._coupons.nextCode(CouponType.EXCHANGE),
      type: CouponType.EXCHANGE,
      discountType: CouponDiscountType.FIXED,
      customer: exchange.sale.customer,
      value: exchange.total,
      singleUse: true,
      used: false,
    });
    await this._coupons.add(coupon);
    exchange.receive(receivedAt, returnToStock, coupon);
    await this._exchanges.update(exchange);

    return { code: coupon.code, value: coupon.value };
  }
}
