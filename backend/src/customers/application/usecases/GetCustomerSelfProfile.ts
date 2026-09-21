import { UsersRepository } from 'src/users/domain/repositories/UsersRepository';
import { CustomerRepository } from '../../domain/repositories/CustomerRepository';
import { CustomerMapper } from '../mappers/CustomerMapper';
import { ManageCustomerProfiles } from './ManageCustomerProfiles';
import { CustomerUserRule } from '../rules/CustomerUserRule';
import { NotFound } from 'src/shared/domain/errors/NotFound';
import { MessageKeyEnum } from 'src/shared/domain/enums/MessageKeyEnum';
export class GetCustomerSelfProfile {
  public constructor(
    private readonly users: UsersRepository,
    private readonly customers: CustomerRepository,
    private readonly profiles: ManageCustomerProfiles,
    private readonly mapper: CustomerMapper,
  ) {}
  public async execute(userId: number) {
    const user = await this.users.findById(userId);
    if (!user)
      throw new NotFound(MessageKeyEnum.ENTITY_NOT_FOUND, { id: userId });
    await new CustomerUserRule().validate(user);
    const customer = await this.customers.findByUserId(userId);
    if (!customer) return { complete: false };
    return {
      complete: true,
      customer: await this.mapper.toDto(customer),
      addresses: await this.profiles.listAddresses(customer.id),
      cards: await this.profiles.listCards(customer.id),
    };
  }
}
