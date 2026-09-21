import { EntityToOutputDto } from 'src/shared/application/protocols/mappers/EntityToOutputDto';
import { ExchangeRequest } from '../../domain/entities/ExchangeRequest';
import { ExchangeRequestDto } from '../dto/ExchangeRequestDto';

export class ExchangeRequestMapper implements EntityToOutputDto<
  ExchangeRequest,
  ExchangeRequestDto
> {
  public toDto(exchange: ExchangeRequest): Promise<ExchangeRequestDto> {
    return Promise.resolve(
      new ExchangeRequestDto(
        exchange.id,
        exchange.reason,
        exchange.reviewObservation,
        exchange.code,
        exchange.sale.id,
        exchange.sale.code,
        exchange.sale.customer.name,
        exchange.items.map((item) => ({
          bookId: item.book.id,
          title: item.book.title,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
        exchange.status,
        exchange.requestedAt,
        exchange.receivedAt,
        exchange.returnToStock,
        exchange.coupon
          ? { code: exchange.coupon.code, value: exchange.coupon.value }
          : undefined,
        exchange.total,
      ),
    );
  }
}
