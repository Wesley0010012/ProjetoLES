import { BookRepository } from 'src/books/domain/repositories/BookRepository';
import { CustomerAddressRepository } from 'src/customers/domain/repositories/CustomerAddressRepository';
import { CustomerCreditCardRepository } from 'src/customers/domain/repositories/CustomerCreditCardRepository';
import { CustomerRepository } from 'src/customers/domain/repositories/CustomerRepository';
import { CouponType } from 'src/sales/domain/enums/CouponType';
import { Sale } from 'src/sales/domain/entities/Sale';
import { CouponRepository } from 'src/sales/domain/repositories/CouponRepository';
import { ExchangeRequestRepository } from 'src/sales/domain/repositories/ExchangeRequestRepository';
import { SaleRepository } from 'src/sales/domain/repositories/SaleRepository';
import { UpdateStatus } from 'src/sales/application/usecases/UpdateStatus';
import { MessageKeyEnum } from 'src/shared/domain/enums/MessageKeyEnum';
import { BadRequest } from 'src/shared/domain/errors/BadRequest';
import { NotFound } from 'src/shared/domain/errors/NotFound';
import { StockMovement } from 'src/stock/domain/entities/StockMovement';
import { StockMovementType } from 'src/stock/domain/enums/StockMovementType';
import { BookSalePriceRepository } from 'src/stock/domain/repositories/BookSalePriceRepository';
import { StockBalanceRepository } from 'src/stock/domain/repositories/StockBalanceRepository';
import { StockMovementRepository } from 'src/stock/domain/repositories/StockMovementRepository';
import { Rule } from 'src/shared/application/protocols/rules/Rule';
import { ShoppingCart } from '../../domain/entities/ShoppingCart';
import { ShoppingCartRepository } from '../../domain/repositories/ShoppingCartRepository';
import { PaymentService } from '../protocols/PaymentService';
import { ShoppingCartMapper } from '../mappers/ShoppingCartMapper';
import { StorefrontSaleMapper } from '../mappers/StorefrontSaleMapper';
import { RecommendBooks } from './RecommendBooks';

export type ShoppingRules = {
  cancellableSale: Rule<Sale>;
};

const CART_TTL_MS = 30 * 60 * 1000;

export abstract class ShoppingUseCase {
  public constructor(
    protected readonly _customers: CustomerRepository,
    protected readonly _addresses: CustomerAddressRepository,
    protected readonly _cards: CustomerCreditCardRepository,
    protected readonly _books: BookRepository,
    protected readonly _balances: StockBalanceRepository,
    protected readonly _prices: BookSalePriceRepository,
    protected readonly _movements: StockMovementRepository,
    protected readonly _carts: ShoppingCartRepository,
    protected readonly _sales: SaleRepository,
    protected readonly _exchanges: ExchangeRequestRepository,
    protected readonly _coupons: CouponRepository,
    protected readonly _payments: PaymentService,
    protected readonly _recommendations: RecommendBooks,
    protected readonly _rules: ShoppingRules,
    protected readonly _cartMapper: ShoppingCartMapper,
    protected readonly _saleMapper: StorefrontSaleMapper,
    protected readonly _updateSaleStatus: UpdateStatus,
  ) {}

  protected async customerSale(userId: number, saleId: number) {
    const customer = await this.customer(userId);
    const sale = await this._sales.findById(saleId);
    if (!sale || sale.customer.id !== customer.id)
      throw new NotFound(MessageKeyEnum.ENTITY_NOT_FOUND, { id: saleId });
    return sale;
  }

  protected async customer(userId: number) {
    const customer = await this._customers.findByUserId(userId);
    if (!customer || !customer.isActive()) {
      throw new BadRequest(MessageKeyEnum.INVALID_PARAM, { param: 'profile' });
    }
    return customer;
  }

  protected async cartFor(customerId: number): Promise<ShoppingCart> {
    let cart = await this._carts.findByCustomerId(customerId);
    if (!cart) {
      const customer = await this._customers.findById(customerId);
      if (!customer) {
        throw new NotFound(MessageKeyEnum.ENTITY_NOT_FOUND, { id: customerId });
      }
      cart = new ShoppingCart({ customer, items: [] });
      await this._carts.add(cart);
    }
    return cart;
  }

  protected async expireCart(cart: ShoppingCart): Promise<void> {
    if (
      !cart.lastItemAddedAt ||
      Date.now() - cart.lastItemAddedAt.getTime() < CART_TTL_MS
    ) {
      return;
    }
    for (const item of cart.items) {
      const balance = await this._balances.findByBookId(item.book.id);
      if (balance) {
        balance.unblock(item.quantity);
        await this._balances.update(balance);
      }
    }
    cart.items = [];
    cart.lastItemAddedAt = undefined;
    await this._carts.update(cart);
  }

  protected freight(cart: ShoppingCart): number {
    return this._cartMapper.freight(cart);
  }

  protected async couponValue(
    customerId: number,
    codes: string[],
    total: number,
  ): Promise<{ value: number; excess: number }> {
    const normalizedCodes = codes.map((code) => code.trim().toUpperCase());
    if (new Set(normalizedCodes).size !== normalizedCodes.length) {
      throw new BadRequest(MessageKeyEnum.INVALID_PARAM, {
        param: 'couponCodes',
      });
    }
    const promotionalValues: number[] = [];
    const exchangeValues: number[] = [];
    for (const code of codes) {
      const coupon = await this._coupons.findByCode(code);
      if (!coupon || !coupon.canBeUsedBy(customerId)) {
        throw new BadRequest(MessageKeyEnum.INVALID_PARAM, {
          param: 'couponCodes',
        });
      }
      const value = coupon.discountFor(total);
      if (coupon.type === CouponType.PROMOTIONAL) {
        promotionalValues.push(value);
      } else {
        exchangeValues.push(value);
      }
    }
    if (promotionalValues.length > 1) {
      throw new BadRequest(MessageKeyEnum.INVALID_PARAM, {
        param: 'couponCodes',
      });
    }
    const rawValue =
      (promotionalValues[0] ?? 0) +
      exchangeValues.reduce((sum, value) => sum + value, 0);
    if (
      rawValue > total &&
      exchangeValues.some((value) => rawValue - value >= total)
    ) {
      throw new BadRequest(MessageKeyEnum.INVALID_PARAM, {
        param: 'couponCodes',
      });
    }
    return {
      value: Math.round(Math.min(total, rawValue) * 100) / 100,
      excess: Math.round(Math.max(0, rawValue - total) * 100) / 100,
    };
  }

  protected async useCoupons(codes: string[]): Promise<void> {
    for (const code of codes) {
      const coupon = await this._coupons.findByCode(code);
      if (coupon) {
        coupon.use();
        await this._coupons.update(coupon);
      }
    }
  }

  protected async finishReservations(
    cart: ShoppingCart,
    approved: boolean,
  ): Promise<void> {
    for (const item of cart.items) {
      const balance = await this._balances.findByBookId(item.book.id);
      if (!balance) continue;
      if (approved) {
        balance.commitBlocked(item.quantity);
        await this._movements.add(
          new StockMovement({
            book: item.book,
            type: StockMovementType.WITHDRAWAL,
            quantity: item.quantity,
            occurredAt: new Date(),
          }),
        );
      } else {
        balance.unblock(item.quantity);
      }
      await this._balances.update(balance);
    }
  }
}
