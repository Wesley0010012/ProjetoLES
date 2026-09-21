import { MessageKeyEnum } from 'src/shared/domain/enums/MessageKeyEnum';
import { NotFound } from 'src/shared/domain/errors/NotFound';
import { UsersRepository } from 'src/users/domain/repositories/UsersRepository';
import { CustomerRepository } from 'src/customers/domain/repositories/CustomerRepository';

export class DeleteCustomer {
  public constructor(
    private readonly _customersRepository: CustomerRepository,
    private readonly _usersRepository: UsersRepository,
  ) {}

  public async execute(id: number): Promise<void> {
    const customer = await this._customersRepository.findById(id);

    if (!customer) {
      throw new NotFound(MessageKeyEnum.ENTITY_NOT_FOUND, { id });
    }

    customer.deactivate();
    await this._usersRepository.update(customer.user);
    await this._customersRepository.update(customer);
  }
}
