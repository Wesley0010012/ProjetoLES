import { AddInput } from 'src/shared/application/dto/input/AddInput';
import { CustomerData } from '../rules/CustomerDataRule';
import { CustomerAddressData } from '../../presentation/requests/CustomerAddressRequest';
import { CustomerCreditCardData } from '../../presentation/requests/CustomerCreditCardRequest';

export class AddCustomerInput extends AddInput {
  public constructor(
    public readonly userId: number,
    public readonly data: CustomerData,
  ) {
    super();
  }
}

export class AddCustomerAddressInput extends AddInput {
  public constructor(
    public readonly customerId: number,
    public readonly data: CustomerAddressData,
  ) {
    super();
  }
}

export class AddCustomerCreditCardInput extends AddInput {
  public constructor(
    public readonly customerId: number,
    public readonly data: CustomerCreditCardData,
  ) {
    super();
  }
}
