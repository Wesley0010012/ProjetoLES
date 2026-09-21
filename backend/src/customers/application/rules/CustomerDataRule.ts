import { Rule } from 'src/shared/application/protocols/rules/Rule';
import { MessageKeyEnum } from 'src/shared/domain/enums/MessageKeyEnum';
import { BadRequest } from 'src/shared/domain/errors/BadRequest';
import { CPF } from 'src/shared/domain/vo/documents/CPF';
import { Phone } from 'src/shared/domain/vo/Phone';
import { Customer } from '../../domain/entities/Customer';
import { UpdateCustomerDto } from '../dto/UpdateCustomerDto';

export type CustomerData = Omit<
  UpdateCustomerDto,
  'id' | 'email' | 'password' | 'passwordConfirmation'
>;

export class CustomerDataRule implements Rule<CustomerData | Customer> {
  public validate(data: CustomerData | Customer): Promise<void> {
    const invalid = (param: string): never => {
      throw new BadRequest(MessageKeyEnum.INVALID_PARAM, { param });
    };
    const document =
      data instanceof Customer ? data.document.number : data.document;

    if (!data.name.trim()) invalid('name');
    if (Number.isNaN(data.birthDate.getTime()) || data.birthDate > new Date()) {
      invalid('birthDate');
    }
    try {
      new CPF(document);
    } catch {
      invalid('document');
    }
    try {
      const phone =
        data instanceof Customer
          ? data.phone
          : new Phone(data.phoneType, data.phoneDdd, data.phoneNumber);
      new Phone(phone.type, phone.ddd, phone.number);
    } catch {
      invalid('phone');
    }
    return Promise.resolve();
  }
}
