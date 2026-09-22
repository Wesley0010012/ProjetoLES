import { CustomerAddressTypeEnum } from 'src/customers/domain/enums/CustomerAddressTypeEnum';
import { Coupon } from 'src/sales/domain/entities/Coupon';
import { Sale } from 'src/sales/domain/entities/Sale';
import { SaleItem } from 'src/sales/domain/entities/SaleItem';
import { CouponDiscountType } from 'src/sales/domain/enums/CouponDiscountType';
import { CouponType } from 'src/sales/domain/enums/CouponType';
import { SaleStatus } from 'src/sales/domain/enums/SaleStatus';
import { MessageKeyEnum } from 'src/shared/domain/enums/MessageKeyEnum';
import { BadRequest } from 'src/shared/domain/errors/BadRequest';
import { CheckoutInput } from '../ShoppingInputs';
import { ShoppingUseCase } from './ShoppingUseCase';

export class Checkout extends ShoppingUseCase {
  public async execute(userId: number, input: CheckoutInput) {
    const customer = await this.customer(userId);
    const cart = await this.cartFor(customer.id);
    await this.expireCart(cart);

    if (cart.items.length === 0) {
      throw new BadRequest(MessageKeyEnum.INVALID_PARAM, { param: 'cart' });
    }

    const addresses = await this._addresses.findByCustomerId(customer.id);
    const deliveryAddress = addresses.find(
      (address) =>
        address.id === input.addressId &&
        address.type === CustomerAddressTypeEnum.Delivery,
    );
    if (!deliveryAddress) {
      throw new BadRequest(MessageKeyEnum.INVALID_PARAM, {
        param: 'addressId',
      });
    }

    const freight = this.freight(cart);
    const subtotal = cart.subtotal;
    const total = Math.round((subtotal + freight) * 100) / 100;
    const couponApplication = await this.couponValue(
      customer.id,
      input.couponCodes,
      total,
    );
    const amountOnCards =
      Math.round(Math.max(0, total - couponApplication.value) * 100) / 100;
    const cards = await this._cards.findByCustomerId(customer.id);
    const belowMinimum = input.cardPayments.filter(payment => payment.amount < 10);
    const hasResidualCouponPayment = couponApplication.value > 0 && belowMinimum.length === 1;
    const allocations = input.cardPayments.map((payment) => {
      const card = cards.find((item) => item.id === payment.cardId);
      if (!card) {
        throw new BadRequest(MessageKeyEnum.INVALID_PARAM, { param: 'cardId' });
      }
      if (
        payment.amount < 10 &&
        !hasResidualCouponPayment
      ) {
        throw new BadRequest(MessageKeyEnum.INVALID_PARAM, {
          param: 'cardPayment.amount',
        });
      }
      return { card, amount: payment.amount };
    });
    const allocated =
      Math.round(
        allocations.reduce((sum, item) => sum + item.amount, 0) * 100,
      ) / 100;
    if (allocated !== amountOnCards) {
      throw new BadRequest(MessageKeyEnum.INVALID_PARAM, {
        param: 'paymentTotal',
      });
    }

    const approved =
      amountOnCards === 0 || (await this._payments.authorize(allocations));
    const sale = new Sale({
      code: this._sales.nextCode(),
      customer,
      items: cart.items.map(
        (item) => new SaleItem(item.book, item.quantity, item.unitPrice),
      ),
      status: approved ? SaleStatus.OPEN : SaleStatus.REJECTED,
      saleDate: new Date(),
      freight,
      discount: couponApplication.value,
      deliveryAddress: {
        name: deliveryAddress.name,
        street: deliveryAddress.street,
        number: deliveryAddress.number,
        city: deliveryAddress.city,
        state: deliveryAddress.state,
      },
      coupons: input.couponCodes,
      payments: allocations.map(({ card, amount }) => ({
        cardId: card.id,
        brand: card.brand,
        lastFourDigits: card.lastFourDigits,
        amount,
      })),
    });

    await this._sales.add(sale);
    await this.finishReservations(cart, approved);
    if (approved) await this.useCoupons(input.couponCodes);

    const generatedCoupon = await this.createExcessCoupon(
      customer,
      couponApplication.excess,
      approved,
    );
    cart.items = [];
    cart.lastItemAddedAt = undefined;
    await this._carts.update(cart);

    return {
      id: sale.id,
      code: sale.code,
      status: sale.status,
      subtotal,
      freight,
      couponValue: couponApplication.value,
      total,
      generatedCoupon,
    };
  }

  private async createExcessCoupon(
    customer: Awaited<ReturnType<ShoppingUseCase['customer']>>,
    excess: number,
    approved: boolean,
  ): Promise<{ code: string; value: number } | undefined> {
    if (!approved || excess <= 0) return undefined;

    const coupon = new Coupon({
      code: this._coupons.nextCode(CouponType.EXCHANGE),
      type: CouponType.EXCHANGE,
      discountType: CouponDiscountType.FIXED,
      customer,
      value: excess,
      singleUse: true,
      used: false,
    });
    await this._coupons.add(coupon);
    return { code: coupon.code, value: coupon.value };
  }
}
