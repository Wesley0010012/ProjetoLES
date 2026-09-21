import { Request } from 'src/shared/presentation/requests/Request';
import { BadRequest } from 'src/shared/domain/errors/BadRequest';
import { MessageKeyEnum } from 'src/shared/domain/enums/MessageKeyEnum';
import { UpdateCustomerRequest } from './UpdateCustomerRequest';
import { UpdateCustomerDto } from '../../application/dto/UpdateCustomerDto';
import {
  CustomerAddressRequest,
  CustomerAddressData,
} from './CustomerAddressRequest';
import {
  CustomerCreditCardRequest,
  CustomerCreditCardData,
} from './CustomerCreditCardRequest';
export type CompleteCustomerProfileData = {
  personal: UpdateCustomerDto;
  addresses: CustomerAddressData[];
  cards: CustomerCreditCardData[];
};
export class CompleteCustomerProfileRequest extends Request {
  public readonly data: CompleteCustomerProfileData;
  public constructor(body: unknown, email: string) {
    super(body);
    const addresses = this.required('addresses');
    const cards = (body as Record<string, unknown>)?.cards ?? [];
    if (!Array.isArray(addresses) || !addresses.length || !Array.isArray(cards))
      throw new BadRequest(MessageKeyEnum.INVALID_PARAM, {
        param: 'addresses/cards',
      });
    this.data = {
      personal: new UpdateCustomerRequest(1, {
        ...(body as Record<string, unknown>),
        email,
        password: undefined,
        passwordConfirmation: undefined,
      }).toDto(),
      addresses: addresses.map((item) => new CustomerAddressRequest(item).data),
      cards: cards.map((item) => new CustomerCreditCardRequest(item).data),
    };
  }
}
