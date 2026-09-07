import { ErrorStatusEnum } from '../enums/ErrorStatusEnum';
import { MessageKeyEnum } from '../enums/MessageKeyEnum';
import { MessageParams } from '../messages/Message';

export abstract class CustomError extends Error {
  private readonly _status: ErrorStatusEnum;
  private readonly _messageKey: MessageKeyEnum;
  private readonly _messageParams?: MessageParams;

  public constructor(
    messageKey: MessageKeyEnum,
    status: ErrorStatusEnum,
    messageParams?: MessageParams,
  ) {
    super(messageKey);

    this._status = status;
    this._messageKey = messageKey;
    this._messageParams = messageParams;
  }

  public get status(): ErrorStatusEnum {
    return this._status;
  }

  public get messageKey(): MessageKeyEnum {
    return this._messageKey;
  }

  public get messageParams(): MessageParams | undefined {
    return this._messageParams;
  }
}
