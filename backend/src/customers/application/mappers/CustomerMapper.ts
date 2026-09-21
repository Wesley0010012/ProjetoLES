import { EntityToOutputDto } from 'src/shared/application/protocols/mappers/EntityToOutputDto';
import { Customer } from 'src/customers/domain/entities/Customer';
import { CustomerDto } from '../dto/CustomerDto';
import { UpdateInputToEntity } from 'src/shared/application/protocols/mappers/UpdateInputToEntity';
import { UpdateCustomerDto } from '../dto/UpdateCustomerDto';
import { CPF } from 'src/shared/domain/vo/documents/CPF';
import { Phone } from 'src/shared/domain/vo/Phone';

export class CustomerMapper
  implements
    UpdateInputToEntity<UpdateCustomerDto, Customer>,
    EntityToOutputDto<Customer, CustomerDto>
{
  public async updateData(
    input: UpdateCustomerDto,
    entity: Customer,
  ): Promise<void> {
    const document = new CPF(input.document);
    const phone = new Phone(input.phoneType, input.phoneDdd, input.phoneNumber);

    entity.name = input.name;
    entity.gender = input.gender;
    entity.birthDate = input.birthDate;
    entity.document = document;
    entity.phone = phone;

    return Promise.resolve();
  }

  public toDto(customer: Customer): Promise<CustomerDto> {
    return Promise.resolve(
      new CustomerDto(
        customer.id,
        customer.code,
        customer.name,
        customer.gender,
        customer.birthDate.toISOString().slice(0, 10),
        customer.document.number,
        {
          type: customer.phone.type,
          ddd: customer.phone.ddd,
          number: customer.phone.number,
        },
        customer.user.email.address,
        customer.active,
        customer.createdAt,
        customer.updatedAt,
        customer.user.id,
      ),
    );
  }
}
