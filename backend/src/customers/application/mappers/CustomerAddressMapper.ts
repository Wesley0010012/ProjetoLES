import { AddInputToEntity } from 'src/shared/application/protocols/mappers/AddInputToEntity';
import { EntityToOutputDto } from 'src/shared/application/protocols/mappers/EntityToOutputDto';
import { FindRequiredEntity } from 'src/shared/application/usecases/FindRequiredEntity';
import { Customer } from '../../domain/entities/Customer';
import { CustomerAddress } from '../../domain/entities/CustomerAddress';
import { AddCustomerAddressInput } from '../dto/AddCustomerProfileInputs';
import { CustomerAddressDto } from '../dto/CustomerAddressDto';

export class CustomerAddressMapper
  implements
    AddInputToEntity<AddCustomerAddressInput, CustomerAddress>,
    EntityToOutputDto<CustomerAddress, CustomerAddressDto>
{
  public constructor(
    private readonly customers: FindRequiredEntity<Customer>,
  ) {}

  public async toEntity(
    input: AddCustomerAddressInput,
  ): Promise<CustomerAddress> {
    return new CustomerAddress({
      customer: await this.customers.execute(input.customerId),
      ...input.data,
    });
  }

  public toDto(address: CustomerAddress): Promise<CustomerAddressDto> {
    return Promise.resolve(
      new CustomerAddressDto(
        address.id,
        address.name,
        address.residenceType,
        address.streetType,
        address.street,
        address.number,
        address.district,
        address.zipCode,
        address.city,
        address.state,
        address.country,
        address.observations,
        address.type,
      ),
    );
  }
}
