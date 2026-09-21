import { MessageKeyEnum } from 'src/shared/domain/enums/MessageKeyEnum';
import { BadRequest } from 'src/shared/domain/errors/BadRequest';
import { FindRequiredEntity } from 'src/shared/application/usecases/FindRequiredEntity';
import { ExchangeStatus } from 'src/sales/domain/enums/ExchangeStatus';
import { ExchangeRequestRepository } from 'src/sales/domain/repositories/ExchangeRequestRepository';

export class MarkExchangeReceived {
  public constructor(private readonly _exchanges: ExchangeRequestRepository) {}

  public async execute(id: number): Promise<void> {
    const exchange = await new FindRequiredEntity(this._exchanges).execute(id);
    if (exchange.status !== ExchangeStatus.DISPATCHED) {
      throw new BadRequest(MessageKeyEnum.INVALID_PARAM, { param: 'status' });
    }
    exchange.markArrived();
    await this._exchanges.update(exchange);
  }
}
