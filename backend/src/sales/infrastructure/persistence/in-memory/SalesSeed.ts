import { createExchangesSeed } from './ExchangesSeed';
import {
  createReportSalesSeed,
  DEFAULT_REPORT_SALES_COUNT,
} from './ReportSalesSeed';
import { BOOKS_SEED } from 'src/books/infrastructure/persistence/in-memory/BooksSeed';
import { Customer } from 'src/customers/domain/entities/Customer';
import { ExchangeRequest } from 'src/sales/domain/entities/ExchangeRequest';
import { Sale } from 'src/sales/domain/entities/Sale';
import { SaleItem } from 'src/sales/domain/entities/SaleItem';
import { ExchangeStatus } from 'src/sales/domain/enums/ExchangeStatus';
import { SaleStatus } from 'src/sales/domain/enums/SaleStatus';

export function createSalesSeed(
  customers: Customer[],
  reportCount = DEFAULT_REPORT_SALES_COUNT,
  now = new Date(),
  exchangeCount = 1000,
) {
  const [CLIENT_CUSTOMER_SEED, ADA_CUSTOMER_SEED, ALAN_CUSTOMER_SEED] =
    customers;
  const deliveredSale = new Sale(
    {
      code: 'VEN-000001',
      customer: CLIENT_CUSTOMER_SEED,
      items: [
        new SaleItem(BOOKS_SEED[0], 2, 41.6),
        new SaleItem(BOOKS_SEED[2], 1, 28.8),
      ],
      status: SaleStatus.DELIVERED,
      saleDate: new Date('2026-02-10T14:30:00.000Z'),
      freight: 12,
    },
    1,
  );
  const approvedSale = new Sale(
    {
      code: 'VEN-000002',
      customer: ADA_CUSTOMER_SEED,
      items: [new SaleItem(BOOKS_SEED[1], 1, 49.4)],
      status: SaleStatus.PAID,
      saleDate: new Date('2026-03-04T10:15:00.000Z'),
      freight: 10,
    },
    2,
  );
  const transitSale = new Sale(
    {
      code: 'VEN-000003',
      customer: ALAN_CUSTOMER_SEED,
      items: [new SaleItem(BOOKS_SEED[2], 3, 28.8)],
      status: SaleStatus.IN_TRANSIT,
      saleDate: new Date('2026-04-18T18:00:00.000Z'),
      freight: 14,
    },
    3,
  );
  const exchangeSale = new Sale(
    {
      code: 'VEN-000004',
      customer: ADA_CUSTOMER_SEED,
      items: [new SaleItem(BOOKS_SEED[0], 1, 41.6)],
      status: SaleStatus.IN_EXCHANGE,
      saleDate: new Date('2026-05-20T09:20:00.000Z'),
      freight: 9,
    },
    4,
  );

  const sales = [
    deliveredSale,
    approvedSale,
    transitSale,
    exchangeSale,
    ...createReportSalesSeed(customers, reportCount, now),
  ];

  const exchanges = [
    new ExchangeRequest(
      {
        code: 'TRO-000001',
        sale: exchangeSale,
        items: exchangeSale.items,
        status: ExchangeStatus.REQUESTED,
        requestedAt: new Date('2026-05-27T11:00:00.000Z'),
      },
      1,
    ),
  ];

  const generated = createExchangesSeed(sales.slice(4), exchangeCount, now);
  exchanges.push(...generated.exchanges);
  return { sales, exchanges, coupons: generated.coupons };
}
