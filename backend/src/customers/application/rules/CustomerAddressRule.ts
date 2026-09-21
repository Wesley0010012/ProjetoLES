import { CustomerAddressTypeEnum } from 'src/customers/domain/enums/CustomerAddressTypeEnum';
import { Rule } from 'src/shared/application/protocols/rules/Rule';
import { BadRequest } from 'src/shared/domain/errors/BadRequest';
import { MessageKeyEnum } from 'src/shared/domain/enums/MessageKeyEnum';
import { CustomerAddress } from '../../domain/entities/CustomerAddress';
import { CustomerAddressData } from '../../presentation/requests/CustomerAddressRequest';
export class CustomerAddressRule implements Rule<{
  addresses: CustomerAddress[];
  address?: CustomerAddress;
  data?: CustomerAddressData;
}> {
  public validate({
    addresses,
    address,
    data,
  }: {
    addresses: CustomerAddress[];
    address?: CustomerAddress;
    data?: CustomerAddressData;
  }): Promise<void> {
    if (
      address?.type === CustomerAddressTypeEnum.Primary &&
      (!data || data.type !== CustomerAddressTypeEnum.Primary)
    )
      throw new BadRequest(MessageKeyEnum.INVALID_PARAM, {
        param: 'primaryAddress',
      });
    const remaining: { type: CustomerAddressTypeEnum }[] = addresses.filter(
      (item) => item.id !== address?.id,
    );
    if (data) remaining.push(data);
    if (
      address &&
      (address.type === CustomerAddressTypeEnum.Billing ||
        address.type === CustomerAddressTypeEnum.Delivery) &&
      !remaining.some((item) => item.type === address.type)
    )
      throw new BadRequest(MessageKeyEnum.INVALID_PARAM, {
        param: 'billing/deliveryAddress',
      });
    return Promise.resolve();
  }
}
