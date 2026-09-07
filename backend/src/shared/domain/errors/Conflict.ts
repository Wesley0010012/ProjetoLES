import { ErrorStatusEnum } from '../enums/ErrorStatusEnum';
import { MessageKeyEnum } from '../enums/MessageKeyEnum';
import { MessageParams } from '../messages/Message';
import { CustomError } from './CustomError';

export class Conflict extends CustomError {
  public constructor(
    messageKey: MessageKeyEnum = MessageKeyEnum.RESOURCE_CONFLICT,
    messageParams?: MessageParams,
  ) {
    super(messageKey, ErrorStatusEnum.CONFLICT, messageParams);
  }
}
