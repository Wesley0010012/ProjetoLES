import { SalesSearch } from 'src/sales/application/SalesSearch';
import { CouponType } from 'src/sales/domain/enums/CouponType';
import { ShoppingUseCase } from './ShoppingUseCase';

export class ListCustomerCoupons extends ShoppingUseCase {
  public async execute(userId: number) {
    const customer = await this.customer(userId);
    const coupons = (await this._coupons.findAll(new SalesSearch())).entities;

    return coupons
      .filter((coupon) => coupon.canBeUsedBy(customer.id))
      .map((coupon) => ({
        code: coupon.code,
        type: coupon.type,
        discountType: coupon.discountType,
        value: coupon.value,
        description:
          coupon.type === CouponType.EXCHANGE
            ? 'Crédito de troca'
            : 'Cupom promocional',
        active: coupon.active,
        used: coupon.used,
      }));
  }
}
