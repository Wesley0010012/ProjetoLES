import {
  AbstractEntity,
  AbstractEntityProps,
} from 'src/shared/domain/entities/AbstractEntity';
import { Customer } from 'src/customers/domain/entities/Customer';

export type AssistantChatProps = AbstractEntityProps & {
  customer: Customer;
  expiresAt: Date;
};

export class AssistantChat extends AbstractEntity<AssistantChatProps> {
  public get customer(): Customer {
    return this._props.customer;
  }

  public get expiresAt(): Date {
    return this._props.expiresAt;
  }

  public isOpen(now = new Date()): boolean {
    return this.isActive() && this.expiresAt.getTime() > now.getTime();
  }
}
