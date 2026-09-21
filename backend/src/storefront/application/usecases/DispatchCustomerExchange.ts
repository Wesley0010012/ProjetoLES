import { ExchangeSearch } from 'src/sales/application/ExchangeSearch';
import { ExchangeStatus } from 'src/sales/domain/enums/ExchangeStatus';
import { MessageKeyEnum } from 'src/shared/domain/enums/MessageKeyEnum';
import { BadRequest } from 'src/shared/domain/errors/BadRequest';
import { ShoppingUseCase } from './ShoppingUseCase';

export class DispatchCustomerExchange extends ShoppingUseCase {
  public async execute(userId: number, saleId: number) {
    await this.customerSale(userId, saleId);
    const exchanges = (
      await this._exchanges.findAll(
        new ExchangeSearch({ saleId, status: ExchangeStatus.AUTHORIZED }),
      )
    ).entities;

    if (exchanges.length === 0) {
      throw new BadRequest(MessageKeyEnum.INVALID_PARAM, { param: 'status' });
    }

    for (const exchange of exchanges) {
      exchange.dispatch();
      await this._exchanges.update(exchange);
    }
  }
}
