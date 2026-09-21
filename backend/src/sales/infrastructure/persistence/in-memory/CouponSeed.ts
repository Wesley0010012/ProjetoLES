import { Coupon } from 'src/sales/domain/entities/Coupon';
import { CouponDiscountType } from 'src/sales/domain/enums/CouponDiscountType';
import { CouponType } from 'src/sales/domain/enums/CouponType';

export const COUPONS_SEED = [
  new Coupon(
    {
      code: 'LIBRA10',
      type: CouponType.PROMOTIONAL,
      discountType: CouponDiscountType.PERCENTAGE,
      value: 10,
      singleUse: false,
      used: false,
    },
    1,
  ),
];
