import { UpdateStatus } from './application/usecases/UpdateStatus';
import { MarkExchangeReceived } from './application/usecases/MarkExchangeReceived';
import { ProcessExchange } from './application/usecases/ProcessExchange';
import { ExchangeStatus } from './domain/enums/ExchangeStatus';
import { createSalesSeed } from './infrastructure/persistence/in-memory/SalesSeed';
import { CustomerSearch } from 'src/customers/application/CustomerSearch';
import { Module } from '@nestjs/common';
import { SharedModule } from 'src/shared/shared.module';
import { AnalyzeSales } from './application/usecases/AnalyzeSales';
import { AuthorizeExchange } from './application/usecases/AuthorizeExchange';
import { FindAll } from 'src/shared/application/usecases/FindAll';
import { EntityPageToEntityPageDto } from 'src/shared/application/protocols/mappers/EntityPageToEntityPageDto';
import { SaleMapper } from './application/mappers/SaleMapper';
import { ExchangeRequestMapper } from './application/mappers/ExchangeRequestMapper';
import { SaleStatus } from './domain/enums/SaleStatus';
import { InMemoryCouponRepository } from './infrastructure/persistence/in-memory/InMemoryCouponRepository';
import { InMemoryExchangeRequestRepository } from './infrastructure/persistence/in-memory/InMemoryExchangeRequestRepository';
import { InMemorySaleRepository } from './infrastructure/persistence/in-memory/InMemorySaleRepository';
import { ReenterStock } from 'src/stock/application/usecases/ReenterStock';
import { StockModule } from 'src/stock/stock.module';
import { UsersModule } from 'src/users/users.module';
import { SalesController } from './presentation/controllers/SalesController';
import {
  SALES_USE_CASES,
  SalesUseCases,
} from './presentation/controllers/SalesUseCases';
import { CustomersModule } from 'src/customers/customers.module';
import { InMemoryCustomerRepository } from 'src/customers/infrastructure/persistence/in-memory/InMemoryCustomerRepository';
import { withReadCache } from 'src/shared/infrastructure/persistence/withReadCache';

@Module({
  imports: [SharedModule, UsersModule, StockModule, CustomersModule],
  controllers: [SalesController],
  providers: [
    {
      provide: 'SALES_SEED',
      inject: [InMemoryCustomerRepository],
      useFactory: async (customers: InMemoryCustomerRepository) =>
        createSalesSeed(
          (await customers.findAll(new CustomerSearch())).entities,
          process.env.SALES_SEED_COUNT === undefined
            ? undefined
            : Number(process.env.SALES_SEED_COUNT),
          new Date(),
          process.env.EXCHANGES_SEED_COUNT === undefined
            ? undefined
            : Number(process.env.EXCHANGES_SEED_COUNT),
        ),
    },
    {
      provide: InMemorySaleRepository,
      inject: ['SALES_SEED'],
      useFactory: (seed: ReturnType<typeof createSalesSeed>) =>
        withReadCache(new InMemorySaleRepository(seed.sales)),
    },
    {
      provide: InMemoryExchangeRequestRepository,
      inject: ['SALES_SEED'],
      useFactory: (seed: ReturnType<typeof createSalesSeed>) =>
        withReadCache(new InMemoryExchangeRequestRepository(seed.exchanges)),
    },
    {
      provide: InMemoryCouponRepository,
      inject: ['SALES_SEED'],
      useFactory: (seed: ReturnType<typeof createSalesSeed>) =>
        withReadCache(new InMemoryCouponRepository(seed.coupons)),
    },
    {
      provide: SALES_USE_CASES,
      inject: [
        InMemorySaleRepository,
        InMemoryExchangeRequestRepository,
        InMemoryCouponRepository,
        ReenterStock,
      ],
      useFactory: (
        sales: InMemorySaleRepository,
        exchanges: InMemoryExchangeRequestRepository,
        coupons: InMemoryCouponRepository,
        reenterStock: ReenterStock,
      ): SalesUseCases => {
        const list = new FindAll(
          sales,
          new EntityPageToEntityPageDto(new SaleMapper()),
        );
        const updateStatus = new UpdateStatus(sales);
        const listExchanges = new FindAll(
          exchanges,
          new EntityPageToEntityPageDto(new ExchangeRequestMapper()),
        );
        const authorize = new AuthorizeExchange(exchanges);
        const markReceived = new MarkExchangeReceived(exchanges);
        const processExchange = new ProcessExchange(
          exchanges,
          coupons,
          reenterStock,
        );
        const analyze = new AnalyzeSales(sales);

        return {
          list: (search) => list.execute(search),
          process: (id) => updateStatus.execute(id, SaleStatus.PROCESSING),
          confirmPayment: (id) => updateStatus.execute(id, SaleStatus.PAID),
          dispatch: (id) => updateStatus.execute(id, SaleStatus.IN_TRANSIT),
          deliver: (id) => updateStatus.execute(id, SaleStatus.DELIVERED),
          exchanges: (search) => listExchanges.execute(search),
          authorizeExchange: (id, observation) =>
            authorize.execute(id, observation),
          rejectExchange: async (id, observation) => {
            await processExchange.execute(id, {
              status: ExchangeStatus.REJECTED,
              observation,
            });
          },
          markExchangeReceived: (id) => markReceived.execute(id),
          receiveExchange: (id, returnToStock, receivedAt) =>
            processExchange.execute(id, {
              status: ExchangeStatus.RECEIVED,
              returnToStock,
              receivedAt,
            }),
          analyze: (startDate, endDate, groupBy) =>
            analyze.execute(startDate, endDate, groupBy),
        };
      },
    },
  ],
  exports: [
    InMemorySaleRepository,
    InMemoryExchangeRequestRepository,
    InMemoryCouponRepository,
  ],
})
export class SalesModule {}
