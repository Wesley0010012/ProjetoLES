import { MessageKeyEnum } from 'src/shared/domain/enums/MessageKeyEnum';
import { BadRequest } from 'src/shared/domain/errors/BadRequest';
import { Request } from 'src/shared/presentation/requests/Request';

export class ReceiveExchangeRequest extends Request {
  public readonly returnToStock: boolean;
  public readonly receivedAt: Date;

  public constructor(data: unknown) {
    super(data);
    const returnToStock = this.required('returnToStock');
    const receivedAt = new Date(this.string('receivedAt'));

    if (typeof returnToStock !== 'boolean') {
      throw new BadRequest(MessageKeyEnum.INVALID_PARAM, {
        param: 'returnToStock',
      });
    }
    if (Number.isNaN(receivedAt.getTime())) {
      throw new BadRequest(MessageKeyEnum.INVALID_PARAM, {
        param: 'receivedAt',
      });
    }

    this.returnToStock = returnToStock;
    this.receivedAt = receivedAt;
  }
}
