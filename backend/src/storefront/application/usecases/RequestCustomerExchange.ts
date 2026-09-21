import { ExchangeInput } from '../ShoppingInputs';
import { ExchangeRequest } from 'src/sales/domain/entities/ExchangeRequest';
import { SaleItem } from 'src/sales/domain/entities/SaleItem';
import { ExchangeStatus } from 'src/sales/domain/enums/ExchangeStatus';
import { SaleStatus } from 'src/sales/domain/enums/SaleStatus';
import { MessageKeyEnum } from 'src/shared/domain/enums/MessageKeyEnum';
import { BadRequest } from 'src/shared/domain/errors/BadRequest';
import { ShoppingUseCase } from './ShoppingUseCase';

export class RequestCustomerExchange extends ShoppingUseCase {
  public async execute(userId: number, input: ExchangeInput) {
    const customer = await this.customer(userId);
    const sale = await this._sales.findById(input.saleId);
    const isCustomerDeliveredSale =
      sale &&
      sale.customer.id === customer.id &&
      sale.status === SaleStatus.DELIVERED;

    if (!isCustomerDeliveredSale) {
      throw new BadRequest(MessageKeyEnum.INVALID_PARAM, { param: 'saleId' });
    }

    const items = input.items.map((requested) => {
      const saleItem = sale.items.find(
        (candidate) =>
          candidate.book.id === requested.bookId &&
          requested.quantity > 0 &&
          requested.quantity <= candidate.quantity,
      );

      if (!saleItem) {
        throw new BadRequest(MessageKeyEnum.INVALID_PARAM, { param: 'items' });
      }

      return new SaleItem(
        saleItem.book,
        requested.quantity,
        saleItem.unitPrice,
      );
    });
    const exchange = new ExchangeRequest({
      code: this._exchanges.nextCode(),
      reason: input.reason,
      sale,
      items,
      status: ExchangeStatus.REQUESTED,
      requestedAt: new Date(),
    });

    await this._exchanges.add(exchange);

    const isFullExchange =
      items.length === sale.items.length &&
      items.every((item) =>
        sale.items.some(
          (saleItem) =>
            saleItem.book.id === item.book.id &&
            saleItem.quantity === item.quantity,
        ),
      );
    if (isFullExchange) {
      sale.status = SaleStatus.IN_EXCHANGE;
      await this._sales.update(sale);
    }

    return { id: exchange.id, code: exchange.code };
  }
}
