import { ErrorStatusEnum } from '../enums/ErrorStatusEnum';
import { MessageKeyEnum } from '../enums/MessageKeyEnum';
import { MessageParams } from '../messages/Message';
import { CustomError } from './CustomError';

export class InternalError extends CustomError {
  public constructor(
    messageKey: MessageKeyEnum,
    messageParams?: MessageParams,
  ) {
    super(messageKey, ErrorStatusEnum.INTERNAL_ERROR, messageParams);
  }
}
