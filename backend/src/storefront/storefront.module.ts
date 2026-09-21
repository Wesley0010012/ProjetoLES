import { Module } from '@nestjs/common';
import { BooksModule } from 'src/books/books.module';
import { InMemoryBooksRepository } from 'src/books/infrastructure/persistence/in-memory/InMemoryBooksRepository';
import { CustomersModule } from 'src/customers/customers.module';
import { InMemoryCustomerAddressRepository } from 'src/customers/infrastructure/persistence/in-memory/InMemoryCustomerAddressRepository';
import { InMemoryCustomerCreditCardRepository } from 'src/customers/infrastructure/persistence/in-memory/InMemoryCustomerCreditCardRepository';
import { InMemoryCustomerRepository } from 'src/customers/infrastructure/persistence/in-memory/InMemoryCustomerRepository';
import { SalesModule } from 'src/sales/sales.module';
import { InMemoryCouponRepository } from 'src/sales/infrastructure/persistence/in-memory/InMemoryCouponRepository';
import { InMemoryExchangeRequestRepository } from 'src/sales/infrastructure/persistence/in-memory/InMemoryExchangeRequestRepository';
import { InMemorySaleRepository } from 'src/sales/infrastructure/persistence/in-memory/InMemorySaleRepository';
import { StockModule } from 'src/stock/stock.module';
import { InMemoryBookSalePriceRepository } from 'src/stock/infrastructure/persistence/in-memory/InMemoryBookSalePriceRepository';
import { InMemoryStockBalanceRepository } from 'src/stock/infrastructure/persistence/in-memory/InMemoryStockBalanceRepository';
import { InMemoryStockMovementRepository } from 'src/stock/infrastructure/persistence/in-memory/InMemoryStockMovementRepository';
import { GetShoppingCart } from './application/usecases/GetShoppingCart';
import { AddCartItem } from './application/usecases/AddCartItem';
import { UpdateCartItem } from './application/usecases/UpdateCartItem';
import { RemoveCartItem } from './application/usecases/RemoveCartItem';
import { Checkout } from './application/usecases/Checkout';
import { ListCustomerOrders } from './application/usecases/ListCustomerOrders';
import { RequestCustomerExchange } from './application/usecases/RequestCustomerExchange';
import { RecommendCustomerBooks } from './application/usecases/RecommendCustomerBooks';
import { ListCustomerCoupons } from './application/usecases/ListCustomerCoupons';
import { ConfirmOrderReceipt } from './application/usecases/ConfirmOrderReceipt';
import { CancelOrder } from './application/usecases/CancelOrder';
import { DispatchCustomerExchange } from './application/usecases/DispatchCustomerExchange';
import { MockPaymentService } from './infrastructure/gateways/MockPaymentService';
import { RecommendBooks } from './application/usecases/RecommendBooks';
import { UpdateStatus } from 'src/sales/application/usecases/UpdateStatus';
import { BOOK_USE_CASES } from 'src/books/presentation/controllers/BookUseCases';
import type { BookUseCases } from 'src/books/presentation/controllers/BookUseCases';
import { CancellableSaleRule } from './application/rules/CancellableSaleRule';
import { ShoppingCartMapper } from './application/mappers/ShoppingCartMapper';
import { StorefrontSaleMapper } from './application/mappers/StorefrontSaleMapper';
import { InMemoryShoppingCartRepository } from './infrastructure/persistence/in-memory/InMemoryShoppingCartRepository';
import {
  CUSTOMER_SHOPPING_USE_CASES,
  CustomerShoppingUseCases,
} from './presentation/controllers/CustomerShoppingUseCases';
import { CustomerShoppingController } from './presentation/controllers/CustomerShoppingController';

@Module({
  imports: [BooksModule, CustomersModule, StockModule, SalesModule],
  controllers: [CustomerShoppingController],
  providers: [
    InMemoryShoppingCartRepository,
    MockPaymentService,
    {
      provide: RecommendBooks,
      inject: [BOOK_USE_CASES, InMemorySaleRepository],
      useFactory: (books: BookUseCases, sales: InMemorySaleRepository) =>
        new RecommendBooks(books, sales),
    },
    {
      provide: CUSTOMER_SHOPPING_USE_CASES,
      inject: [
        InMemoryCustomerRepository,
        InMemoryCustomerAddressRepository,
        InMemoryCustomerCreditCardRepository,
        InMemoryBooksRepository,
        InMemoryStockBalanceRepository,
        InMemoryBookSalePriceRepository,
        InMemoryStockMovementRepository,
        InMemoryShoppingCartRepository,
        InMemorySaleRepository,
        InMemoryExchangeRequestRepository,
        InMemoryCouponRepository,
        MockPaymentService,
        RecommendBooks,
      ],
      useFactory: (
        customers: InMemoryCustomerRepository,
        addresses: InMemoryCustomerAddressRepository,
        cards: InMemoryCustomerCreditCardRepository,
        books: InMemoryBooksRepository,
        balances: InMemoryStockBalanceRepository,
        prices: InMemoryBookSalePriceRepository,
        movements: InMemoryStockMovementRepository,
        carts: InMemoryShoppingCartRepository,
        sales: InMemorySaleRepository,
        exchanges: InMemoryExchangeRequestRepository,
        coupons: InMemoryCouponRepository,
        payments: MockPaymentService,
        recommendations: RecommendBooks,
      ): CustomerShoppingUseCases => {
        const dependencies = [
          customers,
          addresses,
          cards,
          books,
          balances,
          prices,
          movements,
          carts,
          sales,
          exchanges,
          coupons,
          payments,
          recommendations,
          {
            cancellableSale: new CancellableSaleRule(),
          },
          new ShoppingCartMapper(),
          new StorefrontSaleMapper(),
          new UpdateStatus(sales),
        ] as const;
        const getCart = new GetShoppingCart(...dependencies);
        const addItem = new AddCartItem(...dependencies);
        const updateItem = new UpdateCartItem(...dependencies);
        const removeItem = new RemoveCartItem(...dependencies);
        const checkout = new Checkout(...dependencies);
        const orders = new ListCustomerOrders(...dependencies);
        const requestExchange = new RequestCustomerExchange(...dependencies);
        const recommendationsUseCase = new RecommendCustomerBooks(
          ...dependencies,
        );
        const couponsUseCase = new ListCustomerCoupons(...dependencies);
        const confirmReceipt = new ConfirmOrderReceipt(...dependencies);
        const cancelOrder = new CancelOrder(...dependencies);
        const dispatchExchange = new DispatchCustomerExchange(...dependencies);

        return {
          cart: (userId: number) => getCart.execute(userId),
          addItem: (userId: number, bookId: number, quantity: number) =>
            addItem.execute(userId, bookId, quantity),
          updateItem: (userId: number, bookId: number, quantity: number) =>
            updateItem.execute(userId, bookId, quantity),
          removeItem: (userId: number, bookId: number) =>
            removeItem.execute(userId, bookId),
          checkout: (userId: number, input) => checkout.execute(userId, input),
          orders: (userId: number) => orders.execute(userId),
          requestExchange: (userId: number, input) =>
            requestExchange.execute(userId, input),
          recommendations: (userId: number, context: string) =>
            recommendationsUseCase.execute(userId, context),
          coupons: (userId: number) => couponsUseCase.execute(userId),
          confirmReceipt: (userId: number, saleId: number) =>
            confirmReceipt.execute(userId, saleId),
          cancelOrder: (userId: number, saleId: number) =>
            cancelOrder.execute(userId, saleId),
          dispatchExchange: (userId: number, saleId: number) =>
            dispatchExchange.execute(userId, saleId),
        };
      },
    },
  ],
})
export class StorefrontModule {}
