import { AddInputToEntity } from 'src/shared/application/protocols/mappers/AddInputToEntity';
import { FindRequiredEntity } from 'src/shared/application/usecases/FindRequiredEntity';
import { CPF } from 'src/shared/domain/vo/documents/CPF';
import { Phone } from 'src/shared/domain/vo/Phone';
import { User } from 'src/users/domain/entities/User';
import { Customer } from '../../domain/entities/Customer';
import { AddCustomerInput } from '../dto/AddCustomerProfileInputs';

export class AddCustomerMapper implements AddInputToEntity<
  AddCustomerInput,
  Customer
> {
  public constructor(private readonly users: FindRequiredEntity<User>) {}

  public async toEntity(input: AddCustomerInput): Promise<Customer> {
    const user = await this.users.execute(input.userId);
    const data = input.data;
    return new Customer({
      name: data.name,
      gender: data.gender,
      birthDate: data.birthDate,
      document: new CPF(data.document),
      phone: new Phone(data.phoneType, data.phoneDdd, data.phoneNumber),
      user,
    });
  }
}
