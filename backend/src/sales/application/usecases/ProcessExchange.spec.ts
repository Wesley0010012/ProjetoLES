import { ProcessExchange } from './ProcessExchange';
import { ExchangeRequest } from '../../domain/entities/ExchangeRequest';
import { ExchangeStatus } from '../../domain/enums/ExchangeStatus';
import { ExchangeRequestRepository } from '../../domain/repositories/ExchangeRequestRepository';
import { CouponRepository } from '../../domain/repositories/CouponRepository';
import { ReenterStock } from 'src/stock/application/usecases/ReenterStock';
import { BadRequest } from 'src/shared/domain/errors/BadRequest';
import { NotFound } from 'src/shared/domain/errors/NotFound';

function setup(status: ExchangeStatus) {
  const exchange = {
    status,
    items: [{ book: { id: 7 }, quantity: 2 }],
    sale: { customer: { id: 1 } },
    total: 83.2,
    reject: jest.fn(),
    receive: jest.fn(),
  };
  const exchanges = {
    findById: jest
      .fn<Promise<ExchangeRequest | null>, [number]>()
      .mockResolvedValue(exchange as unknown as ExchangeRequest),
    update: jest.fn().mockResolvedValue(undefined),
  };
  const coupons = {
    nextCode: jest.fn().mockReturnValue('TROCA-000001'),
    add: jest.fn().mockResolvedValue(undefined),
  };
  const stock = { execute: jest.fn().mockResolvedValue(undefined) };
  const useCase = new ProcessExchange(
    exchanges as unknown as ExchangeRequestRepository,
    coupons as unknown as CouponRepository,
    stock as unknown as ReenterStock,
  );
  return { useCase, exchange, exchanges, coupons, stock };
}

describe('ProcessExchange', () => {
  it('rejects a requested exchange without issuing a coupon or returning stock', async () => {
    const { useCase, exchange, exchanges, coupons, stock } = setup(
      ExchangeStatus.REQUESTED,
    );
    await expect(
      useCase.execute(1, {
        status: ExchangeStatus.REJECTED,
        observation: 'Fora do prazo',
      }),
    ).resolves.toBeUndefined();
    expect(exchange.reject).toHaveBeenCalledWith('Fora do prazo');
    expect(exchanges.update).toHaveBeenCalledWith(exchange);
    expect(coupons.add).not.toHaveBeenCalled();
    expect(stock.execute).not.toHaveBeenCalled();
  });

  it.each([true, false])(
    'receives an arrived exchange with returnToStock=%s',
    async (returnToStock) => {
      const { useCase, exchange, exchanges, coupons, stock } = setup(
        ExchangeStatus.ARRIVED,
      );
      const receivedAt = new Date('2026-09-20');
      await expect(
        useCase.execute(1, {
          status: ExchangeStatus.RECEIVED,
          returnToStock,
          receivedAt,
        }),
      ).resolves.toEqual({ code: 'TROCA-000001', value: 83.2 });
      expect(stock.execute).toHaveBeenCalledTimes(returnToStock ? 1 : 0);
      expect(coupons.add).toHaveBeenCalledTimes(1);
      expect(exchange.receive).toHaveBeenCalledWith(
        receivedAt,
        returnToStock,
        coupons.add.mock.calls[0][0],
      );
      expect(exchanges.update).toHaveBeenCalledWith(exchange);
    },
  );

  it.each([
    ExchangeStatus.AUTHORIZED,
    ExchangeStatus.RECEIVED,
    ExchangeStatus.REJECTED,
  ])(
    'rejects both decisions in status %s without side effects',
    async (status) => {
      const { useCase, exchanges, coupons, stock } = setup(status);
      await expect(
        useCase.execute(1, { status: ExchangeStatus.REJECTED }),
      ).rejects.toBeInstanceOf(BadRequest);
      await expect(
        useCase.execute(1, {
          status: ExchangeStatus.RECEIVED,
          returnToStock: true,
          receivedAt: new Date(),
        }),
      ).rejects.toBeInstanceOf(BadRequest);
      expect(exchanges.update).not.toHaveBeenCalled();
      expect(coupons.add).not.toHaveBeenCalled();
      expect(stock.execute).not.toHaveBeenCalled();
    },
  );

  it('reports a missing exchange', async () => {
    const { useCase, exchanges } = setup(ExchangeStatus.REQUESTED);
    exchanges.findById.mockResolvedValue(null);
    await expect(
      useCase.execute(999, { status: ExchangeStatus.REJECTED }),
    ).rejects.toBeInstanceOf(NotFound);
  });
});
