import { UpdateUserDto } from 'src/users/application/dto/UpdateUserDto';
import { UpdateEntity } from 'src/shared/application/usecases/UpdateEntity';
import { User } from 'src/users/domain/entities/User';
import { UserDto } from 'src/users/application/dto/UserDto';
import { NotFound } from 'src/shared/domain/errors/NotFound';
import { MessageKeyEnum } from 'src/shared/domain/enums/MessageKeyEnum';
import { CustomerRepository } from '../../domain/repositories/CustomerRepository';
import { Customer } from '../../domain/entities/Customer';
import { CustomerDto } from '../dto/CustomerDto';
import { UpdateCustomerDto } from '../dto/UpdateCustomerDto';

export class UpdateCustomer {
  public constructor(
    private readonly customers: CustomerRepository,
    private readonly updateUser: UpdateEntity<User, UpdateUserDto, UserDto>,
    private readonly updateCustomer: UpdateEntity<
      Customer,
      UpdateCustomerDto,
      CustomerDto
    >,
  ) {}
  public async execute(input: UpdateCustomerDto) {
    const customer = await this.customers.findById(input.id);

    if (!customer || !customer.isActive())
      throw new NotFound(MessageKeyEnum.ENTITY_NOT_FOUND, { id: input.id });

    await this.updateUser.execute(
      new UpdateUserDto(customer.user.id, customer.user.email.address),
    );

    return this.updateCustomer.execute(input);
  }
}
