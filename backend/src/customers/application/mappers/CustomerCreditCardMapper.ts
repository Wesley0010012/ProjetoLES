import { AddInputToEntity } from 'src/shared/application/protocols/mappers/AddInputToEntity';
import { EntityToOutputDto } from 'src/shared/application/protocols/mappers/EntityToOutputDto';
import { FindRequiredEntity } from 'src/shared/application/usecases/FindRequiredEntity';
import { Customer } from '../../domain/entities/Customer';
import { CustomerCreditCard } from '../../domain/entities/CustomerCreditCard';
import { CustomerCreditCardRepository } from '../../domain/repositories/CustomerCreditCardRepository';
import {
  CreditCardValidationResult,
  CreditCardValidator,
} from '../gateways/CreditCardValidator';
import { AddCustomerCreditCardInput } from '../dto/AddCustomerProfileInputs';
import { CustomerCreditCardDto } from '../dto/CustomerCreditCardDto';
import { ValidCreditCardRule } from '../rules/ValidCreditCardRule';

export class CustomerCreditCardMapper
  implements
    AddInputToEntity<AddCustomerCreditCardInput, CustomerCreditCard>,
    EntityToOutputDto<CustomerCreditCard, CustomerCreditCardDto>
{
  public constructor(
    private readonly customers: FindRequiredEntity<Customer>,
    private readonly cards: CustomerCreditCardRepository,
    private readonly validator: CreditCardValidator,
  ) {}

  public async toEntity(
    input: AddCustomerCreditCardInput,
  ): Promise<CustomerCreditCard> {
    const customer = await this.customers.execute(input.customerId);
    const validation = await this.validator.validateAndTokenize(input.data);
    await new ValidCreditCardRule().validate(validation);
    const validCard = validation as Extract<
      CreditCardValidationResult,
      { valid: true }
    >;
    const existing = await this.cards.findByCustomerId(customer.id);

    return new CustomerCreditCard({
      customer,
      lastFourDigits: validCard.lastFourDigits,
      printedName: input.data.printedName,
      brand: input.data.brand,
      gatewayToken: validCard.token,
      preferred: input.data.preferred || existing.length === 0,
      description: input.data.description,
    });
  }

  public toDto(card: CustomerCreditCard): Promise<CustomerCreditCardDto> {
    return Promise.resolve(
      new CustomerCreditCardDto(
        card.id,
        card.lastFourDigits,
        card.printedName,
        card.brand,
        card.preferred,
        card.description,
      ),
    );
  }
}
