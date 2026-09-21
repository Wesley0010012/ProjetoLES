import { MessageKeyEnum } from 'src/shared/domain/enums/MessageKeyEnum';
import { BadRequest } from 'src/shared/domain/errors/BadRequest';
import { Request } from 'src/shared/presentation/requests/Request';

export class AssistantMessageRequest extends Request {
  public readonly message: string;

  public constructor(data: unknown) {
    super(data);
    this.message = this.string('message');
    if (this.message.length > 1000) {
      throw new BadRequest(MessageKeyEnum.INVALID_PARAM, { param: 'message' });
    }
  }
}
