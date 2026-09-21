import { createCustomersSeed } from 'src/customers/infrastructure/persistence/in-memory/CustomersSeed';
import { InMemoryUsersRepository } from 'src/users/infrastructure/persistence/in-memory/InMemoryUsersRepository';
import { FindAll } from 'src/shared/application/usecases/FindAll';
import { EntityPageToEntityPageDto } from 'src/shared/application/protocols/mappers/EntityPageToEntityPageDto';
import { EntityPageDto } from 'src/shared/application/dto/output/EntityPageDto';
import { SaleMapper } from 'src/sales/application/mappers/SaleMapper';
import { ExchangeRequestMapper } from 'src/sales/application/mappers/ExchangeRequestMapper';
import { SalesListRequest } from 'src/sales/presentation/requests/SalesListRequest';
import { ExchangeStatus } from 'src/sales/domain/enums/ExchangeStatus';
import { SaleStatus } from 'src/sales/domain/enums/SaleStatus';
import { createSalesSeed } from './SalesSeed';
import { InMemorySaleRepository } from './InMemorySaleRepository';
import { InMemoryExchangeRequestRepository } from './InMemoryExchangeRequestRepository';
import { InMemoryCouponRepository } from './InMemoryCouponRepository';

const referenceDate = new Date('2026-09-13T15:00:00Z');
async function seed() {
  const customers = await createCustomersSeed(new InMemoryUsersRepository());
  return createSalesSeed(customers, 120, referenceDate, 60);
}

describe('Paginação de pedidos e trocas com FindAll', () => {
  it('filtra por cliente antes de paginar e mantém os totais nas páginas vazias', async () => {
    const data = await seed();
    const useCase = new FindAll(
      new InMemorySaleRepository(data.sales),
      new EntityPageToEntityPageDto(new SaleMapper()),
    );
    const expected = data.sales
      .filter((sale) => sale.customer.id === 2)
      .sort((a, b) => b.id - a.id);
    const query = {
      page: '2',
      pageSize: '3',
      orderBy: 'id',
      orderDirection: 'DESC',
    };
    const result = await useCase.execute(
      new SalesListRequest(query).toSearch(2),
    );
    expect(result).toBeInstanceOf(EntityPageDto);
    if (Array.isArray(result)) throw new Error('Esperava uma página');
    expect(result.totalEntities).toBe(expected.length);
    expect(result.totalPages).toBe(Math.ceil(expected.length / 3));
    expect(result.entities.map((sale) => sale.id)).toEqual(
      expected.slice(3, 6).map((sale) => sale.id),
    );
    const empty = await useCase.execute(
      new SalesListRequest({ ...query, page: '999' }).toSearch(2),
    );
    expect(empty).toMatchObject({
      entities: [],
      totalEntities: expected.length,
    });
  });

  it('pagina trocas sem sobrepor os registros e rejeita parâmetros inválidos', async () => {
    const data = await seed();
    const useCase = new FindAll(
      new InMemoryExchangeRequestRepository(data.exchanges),
      new EntityPageToEntityPageDto(new ExchangeRequestMapper()),
    );
    const pages = await Promise.all(
      [1, 2].map((page) =>
        useCase.execute(
          new SalesListRequest({ page, pageSize: 10 }).toSearch(
            undefined,
            true,
          ),
        ),
      ),
    );
    for (const page of pages)
      expect(page).toMatchObject({ totalEntities: 61, totalPages: 7 });
    const ids = pages.flatMap((page) =>
      Array.isArray(page) ? [] : page.entities.map((exchange) => exchange.id),
    );
    expect(new Set(ids).size).toBe(20);
    for (const query of [
      { page: 0 },
      { pageSize: 101 },
      { page: 'abc' },
      { page: 1.2 },
      { orderBy: 'customer' },
      { orderDirection: 'invalid' },
    ]) {
      expect(() => new SalesListRequest(query).toSearch()).toThrow();
    }
  });

  it('gera todos os estados, datas coerentes e cupons resgatáveis sem alterar os pedidos básicos', async () => {
    const data = await seed();
    const generated = data.exchanges.slice(1);
    expect(new Set(generated.map((exchange) => exchange.status))).toEqual(
      new Set(Object.values(ExchangeStatus)),
    );
    expect(new Set(data.exchanges.map((exchange) => exchange.code)).size).toBe(
      61,
    );
    expect(data.sales[0].status).toBe(SaleStatus.DELIVERED);
    const coupons = new InMemoryCouponRepository(data.coupons);
    for (const exchange of generated) {
      expect(exchange.requestedAt.getTime()).toBeGreaterThanOrEqual(
        exchange.sale.saleDate.getTime(),
      );
      expect(exchange.requestedAt.getTime()).toBeLessThanOrEqual(
        referenceDate.getTime(),
      );
      if (exchange.status === ExchangeStatus.RECEIVED) {
        expect(exchange.sale.status).toBe(SaleStatus.EXCHANGED);
        expect(exchange.receivedAt!.getTime()).toBeGreaterThanOrEqual(
          exchange.requestedAt.getTime(),
        );
        const coupon = await coupons.findByCode(exchange.coupon!.code);
        expect(coupon?.value).toBe(exchange.total);
        expect(coupon?.customer?.id).toBe(exchange.sale.customer.id);
      }
    }
  });
});
