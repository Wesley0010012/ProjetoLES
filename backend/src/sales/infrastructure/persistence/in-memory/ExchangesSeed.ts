import { Coupon } from 'src/sales/domain/entities/Coupon';
import { ExchangeRequest } from 'src/sales/domain/entities/ExchangeRequest';
import { Sale } from 'src/sales/domain/entities/Sale';
import { CouponDiscountType } from 'src/sales/domain/enums/CouponDiscountType';
import { CouponType } from 'src/sales/domain/enums/CouponType';
import { ExchangeStatus } from 'src/sales/domain/enums/ExchangeStatus';
import { SaleStatus } from 'src/sales/domain/enums/SaleStatus';

export function createExchangesSeed(
  sales: Sale[],
  count = 1000,
  now = new Date(),
) {
  if (!Number.isInteger(count) || count < 0 || count > 100000) {
    throw new RangeError(
      'EXCHANGES_SEED_COUNT deve ser um inteiro entre 0 e 100000',
    );
  }
  const exchanges: ExchangeRequest[] = [];
  const coupons: Coupon[] = [];
  const statuses = Object.values(ExchangeStatus);
  const reasons = [
    'Livro com páginas danificadas',
    'Produto diferente do solicitado',
    'Defeito na encadernação',
    'Desistência da compra',
    'Capa danificada no transporte',
  ];
  const total = Math.min(count, sales.length);
  for (let index = 0; index < total; index++) {
    const sale = sales[Math.floor((index * sales.length) / total)];
    const id = index + 2;
    const status = statuses[index % statuses.length];
    const requestedAt = new Date(
      Math.min(
        now.getTime(),
        sale.saleDate.getTime() + (1 + (index % 7)) * 86400000,
      ),
    );
    const completed = status === ExchangeStatus.RECEIVED;
    const rejected = status === ExchangeStatus.REJECTED;
    const receivedAt = completed
      ? new Date(Math.min(now.getTime(), requestedAt.getTime() + 3 * 86400000))
      : undefined;
    const coupon = completed
      ? new Coupon(
          {
            code: `TROCA-SEED-${String(id).padStart(6, '0')}`,
            type: CouponType.EXCHANGE,
            discountType: CouponDiscountType.FIXED,
            customer: sale.customer,
            value: Math.round(sale.subtotal * 100) / 100,
            singleUse: true,
            used: false,
            createdAt: receivedAt,
          },
          coupons.length + 2,
        )
      : undefined;
    if (coupon) coupons.push(coupon);
    sale.status = completed
      ? SaleStatus.EXCHANGED
      : rejected
        ? SaleStatus.DELIVERED
        : SaleStatus.IN_EXCHANGE;
    sale.updatedAt = receivedAt ?? requestedAt;
    exchanges.push(
      new ExchangeRequest(
        {
          code: `TRO-${String(id).padStart(6, '0')}`,
          sale,
          items: sale.items,
          status,
          reason: reasons[index % reasons.length],
          reviewObservation:
            status === ExchangeStatus.REQUESTED
              ? undefined
              : rejected
                ? 'Solicitação fora das condições de troca.'
                : 'Troca aprovada após análise.',
          requestedAt,
          receivedAt,
          returnToStock: completed ? index % 2 === 0 : undefined,
          coupon,
          createdAt: requestedAt,
          updatedAt: receivedAt ?? requestedAt,
        },
        id,
      ),
    );
  }
  return { exchanges, coupons };
}
