import { MessageKeyEnum } from '../enums/MessageKeyEnum';

export type MessageParams = Record<string, string | number | boolean | Date>;

export type Message = {
  key: MessageKeyEnum;
  params?: MessageParams;
};
