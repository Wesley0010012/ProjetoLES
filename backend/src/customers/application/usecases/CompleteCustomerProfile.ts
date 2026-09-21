import { AddEntity } from 'src/shared/application/usecases/AddEntity';
import { CreatedEntityDto } from 'src/shared/application/dto/output/CreatedEntityDto';
import { MessageKeyEnum } from 'src/shared/domain/enums/MessageKeyEnum';
import { NotFound } from 'src/shared/domain/errors/NotFound';
import { Rule } from 'src/shared/application/protocols/rules/Rule';
import { UsersRepository } from 'src/users/domain/repositories/UsersRepository';
import { CustomerAddress } from '../../domain/entities/CustomerAddress';
import { CustomerCreditCard } from '../../domain/entities/CustomerCreditCard';
import { Customer } from '../../domain/entities/Customer';
import {
  AddCustomerAddressInput,
  AddCustomerCreditCardInput,
  AddCustomerInput,
} from '../dto/AddCustomerProfileInputs';
import { CompleteCustomerProfileData } from '../../presentation/requests/CompleteCustomerProfileRequest';
import { CompleteCustomerProfileInput } from '../rules/CompleteCustomerProfileRule';

export class CompleteCustomerProfile {
  public constructor(
    private readonly users: UsersRepository,
    private readonly profileRule: Rule<CompleteCustomerProfileInput>,
    private readonly addCustomer: AddEntity<
      Customer,
      AddCustomerInput,
      CreatedEntityDto
    >,
    private readonly addAddress: AddEntity<
      CustomerAddress,
      AddCustomerAddressInput,
      CreatedEntityDto
    >,
    private readonly addCard: AddEntity<
      CustomerCreditCard,
      AddCustomerCreditCardInput,
      CreatedEntityDto
    >,
  ) {}

  public async execute(
    userId: number,
    data: CompleteCustomerProfileData,
  ): Promise<number> {
    const user = await this.users.findById(userId);
    if (!user)
      throw new NotFound(MessageKeyEnum.ENTITY_NOT_FOUND, { id: userId });

    await this.profileRule.validate({
      userId,
      addresses: data.addresses,
    });

    const customer = await this.addCustomer.execute(
      new AddCustomerInput(user.id, data.personal),
    );

    await Promise.all(
      data.addresses.map((address) =>
        this.addAddress.execute(
          new AddCustomerAddressInput(customer.id, address),
        ),
      ),
    );

    for (const card of data.cards) {
      await this.addCard.execute(
        new AddCustomerCreditCardInput(customer.id, card),
      );
    }

    return customer.id;
  }
}
