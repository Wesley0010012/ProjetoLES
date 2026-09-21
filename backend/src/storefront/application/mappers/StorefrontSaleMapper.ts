import { EntityToOutputDto } from 'src/shared/application/protocols/mappers/EntityToOutputDto';
import { ExchangeRequest } from 'src/sales/domain/entities/ExchangeRequest';
import { Sale } from 'src/sales/domain/entities/Sale';
import { StorefrontSaleDto } from '../dto/StorefrontSaleDto';

export class StorefrontSaleMapper implements EntityToOutputDto<
  Sale,
  StorefrontSaleDto
> {
  public toDto(
    sale: Sale,
    exchanges: ExchangeRequest[] = [],
  ): Promise<StorefrontSaleDto> {
    return Promise.resolve(
      new StorefrontSaleDto(
        sale.id,
        sale.deliveryAddress,
        sale.subtotal,
        sale.discount,
        sale.coupons,
        sale.payments,
        exchanges.map((exchange) => ({
          code: exchange.code,
          reason: exchange.reason,
          status: exchange.status,
          items: exchange.items.map((item) => ({
            bookId: item.book.id,
            title: item.book.title,
            quantity: item.quantity,
          })),
        })),
        sale.code,
        sale.status,
        sale.saleDate,
        sale.freight,
        sale.total,
        sale.items.map((item) => ({
          bookId: item.book.id,
          title: item.book.title,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total,
        })),
      ),
    );
  }
}
