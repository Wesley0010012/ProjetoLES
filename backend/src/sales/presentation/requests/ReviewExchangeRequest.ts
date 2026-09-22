import { Request } from 'src/shared/presentation/requests/Request';
import { BadRequest } from 'src/shared/domain/errors/BadRequest';
import { MessageKeyEnum } from 'src/shared/domain/enums/MessageKeyEnum';

export class ReviewExchangeRequest extends Request {
  public readonly observation: string;
  public constructor(body: unknown) {
    super(body);
    this.observation = this.string('observation').trim();
    if (this.observation.length < 5 || this.observation.length > 500) {
      throw new BadRequest(MessageKeyEnum.INVALID_PARAM, { param: 'observation' });
    }
  }
}
