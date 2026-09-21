import { ErrorStatusEnum } from '../enums/ErrorStatusEnum';
import { MessageKeyEnum } from '../enums/MessageKeyEnum';
import { MessageParams } from '../messages/Message';
import { CustomError } from './CustomError';

export class Unauthorized extends CustomError {
  public constructor(
    messageKey: MessageKeyEnum = MessageKeyEnum.ACCESS_DENIED,
    messageParams?: MessageParams,
  ) {
    super(messageKey, ErrorStatusEnum.UNAUTHORIZED, messageParams);
  }
}
