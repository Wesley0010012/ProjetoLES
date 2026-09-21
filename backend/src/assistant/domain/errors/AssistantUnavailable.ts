import { CustomError } from 'src/shared/domain/errors/CustomError';
import { ErrorStatusEnum } from 'src/shared/domain/enums/ErrorStatusEnum';
import { MessageKeyEnum } from 'src/shared/domain/enums/MessageKeyEnum';

export class AssistantUnavailable extends CustomError {
  constructor(messageKey = MessageKeyEnum.ASSISTANT_UNAVAILABLE) {
    super(
      messageKey,
      ErrorStatusEnum.SERVICE_UNAVAILABLE,
    );
  }
}
