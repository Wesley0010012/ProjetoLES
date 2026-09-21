import { EntityToOutputDto } from 'src/shared/application/protocols/mappers/EntityToOutputDto';
import { Sale } from '../../domain/entities/Sale';
import { SaleDto } from '../dto/SaleDto';

export class SaleMapper implements EntityToOutputDto<Sale, SaleDto> {
  public toDto(sale: Sale): Promise<SaleDto> {
    return Promise.resolve(
      new SaleDto(
        sale.id,
        sale.deliveryAddress
          ? `${sale.deliveryAddress.street}, ${sale.deliveryAddress.number} · ${sale.deliveryAddress.city}/${sale.deliveryAddress.state}`
          : undefined,
        sale.coupons,
        sale.payments.map((payment) => ({
          label: `${payment.brand} •••• ${payment.lastFourDigits}`,
          amount: payment.amount,
        })),
        sale.code,
        {
          id: sale.customer.id,
          code: sale.customer.code,
          name: sale.customer.name,
        },
        sale.items.map((item) => ({
          bookId: item.book.id,
          code: item.book.code,
          title: item.book.title,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total,
        })),
        sale.status,
        sale.saleDate,
        sale.freight,
        sale.total,
      ),
    );
  }
}
