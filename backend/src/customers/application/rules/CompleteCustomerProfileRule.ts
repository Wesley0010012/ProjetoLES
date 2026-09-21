import { CustomerAddressTypeEnum } from 'src/customers/domain/enums/CustomerAddressTypeEnum';
import { Rule } from 'src/shared/application/protocols/rules/Rule';
import { BadRequest } from 'src/shared/domain/errors/BadRequest';
import { MessageKeyEnum } from 'src/shared/domain/enums/MessageKeyEnum';
import { CustomerRepository } from '../../domain/repositories/CustomerRepository';
import { CustomerAddressData } from '../../presentation/requests/CustomerAddressRequest';
export type CompleteCustomerProfileInput = {
  userId: number;
  addresses: CustomerAddressData[];
};

export class CompleteCustomerProfileRule implements Rule<CompleteCustomerProfileInput> {
  public constructor(private readonly customers: CustomerRepository) {}
  public async validate({
    userId,
    addresses,
  }: CompleteCustomerProfileInput): Promise<void> {
    if (await this.customers.findByUserId(userId))
      throw new BadRequest(MessageKeyEnum.INVALID_PARAM, { param: 'customer' });
    if (
      !addresses.some((a) => a.type === CustomerAddressTypeEnum.Primary) ||
      !addresses.some((a) => a.type === CustomerAddressTypeEnum.Billing) ||
      !addresses.some((a) => a.type === CustomerAddressTypeEnum.Delivery)
    )
      throw new BadRequest(MessageKeyEnum.INVALID_PARAM, {
        param: 'addresses',
      });
  }
}
