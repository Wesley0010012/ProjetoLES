import { MessageParams } from 'src/shared/domain/messages/Message';
import { MessageKeyEnum } from 'src/shared/domain/enums/MessageKeyEnum';

export const MESSAGE_TRANSLATOR = 'MESSAGE_TRANSLATOR';

export interface MessageTranslator {
  translate(
    key: MessageKeyEnum,
    params?: MessageParams,
    locale?: string,
  ): string;
}
