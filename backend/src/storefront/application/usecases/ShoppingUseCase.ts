import { BookRepository } from 'src/books/domain/repositories/BookRepository';
import { CustomerAddressRepository } from 'src/customers/domain/repositories/CustomerAddressRepository';
import { CustomerCreditCardRepository } from 'src/customers/domain/repositories/CustomerCreditCardRepository';
import { CustomerRepository } from 'src/customers/domain/repositories/CustomerRepository';
import { Coupon } from 'src/sales/domain/entities/Coupon';
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

export type CouponConsumption = { coupon: Coupon; amount: number };

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
  ): Promise<{ value: number; consumptions: CouponConsumption[] }> {
    const normalizedCodes = codes.map((code) => code.trim().toUpperCase());
    if (new Set(normalizedCodes).size !== normalizedCodes.length) {
      throw new BadRequest(MessageKeyEnum.INVALID_PARAM, {
        param: 'couponCodes',
      });
    }
    const promotional: CouponConsumption[] = [];
    const exchange: CouponConsumption[] = [];
    for (const code of codes) {
      const coupon = await this._coupons.findByCode(code);
      if (!coupon || !coupon.canBeUsedBy(customerId)) {
        throw new BadRequest(MessageKeyEnum.INVALID_PARAM, {
          param: 'couponCodes',
        });
      }
      const entry = { coupon, amount: coupon.discountFor(total) };
      if (coupon.type === CouponType.PROMOTIONAL) {
        promotional.push(entry);
      } else {
        exchange.push(entry);
      }
    }
    if (promotional.length > 1) {
      throw new BadRequest(MessageKeyEnum.INVALID_PARAM, {
        param: 'couponCodes',
      });
    }
    const rawValue = [...promotional, ...exchange].reduce(
      (sum, item) => sum + item.amount,
      0,
    );
    if (
      rawValue > total &&
      exchange.some((item) => rawValue - item.amount >= total)
    ) {
      throw new BadRequest(MessageKeyEnum.INVALID_PARAM, {
        param: 'couponCodes',
      });
    }
    // O promocional é aplicado primeiro; os cupons de troca cobrem o restante
    // na ordem informada e só têm debitado o valor efetivamente utilizado.
    let remaining = total;
    const consumptions = [...promotional, ...exchange].map(
      ({ coupon, amount }) => {
        const applied = Math.round(Math.min(remaining, amount) * 100) / 100;
        remaining = Math.round((remaining - applied) * 100) / 100;
        return { coupon, amount: applied };
      },
    );
    return {
      value: Math.round((total - remaining) * 100) / 100,
      consumptions,
    };
  }

  protected async useCoupons(consumptions: CouponConsumption[]): Promise<void> {
    for (const { coupon, amount } of consumptions) {
      coupon.consume(amount);
      await this._coupons.update(coupon);
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
