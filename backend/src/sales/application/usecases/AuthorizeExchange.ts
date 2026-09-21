import { MessageKeyEnum } from 'src/shared/domain/enums/MessageKeyEnum';
import { BadRequest } from 'src/shared/domain/errors/BadRequest';
import { FindRequiredEntity } from 'src/shared/application/usecases/FindRequiredEntity';
import { ExchangeStatus } from 'src/sales/domain/enums/ExchangeStatus';
import { ExchangeRequestRepository } from 'src/sales/domain/repositories/ExchangeRequestRepository';

export class AuthorizeExchange {
  public constructor(private readonly _exchanges: ExchangeRequestRepository) {}

  public async execute(id: number, observation = ''): Promise<void> {
    const exchange = await new FindRequiredEntity(this._exchanges).execute(id);
    if (exchange.status !== ExchangeStatus.REQUESTED) {
      throw new BadRequest(MessageKeyEnum.INVALID_PARAM, { param: 'status' });
    }
    exchange.authorize(observation);
    await this._exchanges.update(exchange);
  }
}
