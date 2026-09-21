import { Customer } from '../../domain/entities/Customer';
import { CustomerAddress } from '../../domain/entities/CustomerAddress';
import { CustomerCreditCard } from '../../domain/entities/CustomerCreditCard';
import { CustomerAddressRepository } from '../../domain/repositories/CustomerAddressRepository';
import { CustomerCreditCardRepository } from '../../domain/repositories/CustomerCreditCardRepository';
import { CustomerRepository } from '../../domain/repositories/CustomerRepository';
import { MessageKeyEnum } from 'src/shared/domain/enums/MessageKeyEnum';
import { NotFound } from 'src/shared/domain/errors/NotFound';
import { CustomerAddressData } from '../../presentation/requests/CustomerAddressRequest';
import { CustomerCreditCardData } from '../../presentation/requests/CustomerCreditCardRequest';
import { UpdateCustomerCreditCardData } from '../../presentation/requests/UpdateCustomerCreditCardRequest';
import {
  CreditCardValidator,
  CreditCardValidationResult,
} from '../gateways/CreditCardValidator';
import { CustomerAddressMapper } from '../mappers/CustomerAddressMapper';
import { CustomerCreditCardMapper } from '../mappers/CustomerCreditCardMapper';
import { CustomerAddressRule } from '../rules/CustomerAddressRule';
import { ValidCreditCardRule } from '../rules/ValidCreditCardRule';

type ValidCard = Extract<CreditCardValidationResult, { valid: true }>;
export class ManageCustomerProfiles {
  public constructor(
    private readonly customers: CustomerRepository,
    private readonly addresses: CustomerAddressRepository,
    private readonly cards: CustomerCreditCardRepository,
    private readonly cardValidator: CreditCardValidator,
    private readonly addressMapper: CustomerAddressMapper,
    private readonly cardMapper: CustomerCreditCardMapper,
  ) {}
  public async listAddresses(customerId: number) {
    await this.customer(customerId);
    return Promise.all(
      (await this.addresses.findByCustomerId(customerId)).map((address) =>
        this.addressMapper.toDto(address),
      ),
    );
  }
  public async saveAddress(
    customerId: number,
    data: CustomerAddressData,
    id?: number,
  ) {
    const customer = await this.customer(customerId);
    let address = id ? await this.addresses.findById(id) : null;
    if (
      id &&
      (!address || address.customer.id !== customerId || !address.isActive())
    )
      throw new NotFound(MessageKeyEnum.ENTITY_NOT_FOUND, { id });
    await new CustomerAddressRule().validate({
      addresses: await this.addresses.findByCustomerId(customerId),
      address: address ?? undefined,
      data,
    });
    if (address) {
      Object.assign(address, data);
      await this.addresses.update(address);
    } else {
      address = new CustomerAddress({ customer, ...data });
      await this.addresses.add(address);
    }
    return this.addressMapper.toDto(address);
  }
  public async deleteAddress(customerId: number, id: number): Promise<void> {
    await this.customer(customerId);
    const address = await this.addresses.findById(id);
    if (!address || !address.isActive() || address.customer.id !== customerId)
      throw new NotFound(MessageKeyEnum.ENTITY_NOT_FOUND, { id });
    await new CustomerAddressRule().validate({
      addresses: await this.addresses.findByCustomerId(customerId),
      address,
    });
    address.deactivate();
    await this.addresses.update(address);
  }
  public async listCards(customerId: number) {
    await this.customer(customerId);
    return Promise.all(
      (await this.cards.findByCustomerId(customerId)).map((card) =>
        this.cardMapper.toDto(card),
      ),
    );
  }
  public async validateCard(data: CustomerCreditCardData): Promise<ValidCard> {
    const validation = await this.cardValidator.validateAndTokenize(data);
    await new ValidCreditCardRule().validate(validation);
    return validation as ValidCard;
  }
  public async addCard(customerId: number, data: CustomerCreditCardData) {
    const customer = await this.customer(customerId);
    return this.saveValidatedCard(
      customer,
      data,
      await this.validateCard(data),
    );
  }
  public async saveValidatedCard(
    customer: Customer,
    data: CustomerCreditCardData,
    validation: ValidCard,
  ) {
    const existing = await this.cards.findByCustomerId(customer.id);
    const preferred = data.preferred || existing.length === 0;
    if (preferred) await this.clearPreferredCard(customer.id);
    const card = new CustomerCreditCard({
      customer,
      lastFourDigits: validation.lastFourDigits,
      printedName: data.printedName,
      brand: data.brand,
      gatewayToken: validation.token,
      preferred,
      description: data.description,
    });
    await this.cards.add(card);
    return this.cardMapper.toDto(card);
  }
  public async updateCard(
    customerId: number,
    id: number,
    data: UpdateCustomerCreditCardData,
  ) {
    await this.customer(customerId);
    const card = await this.cards.findById(id);
    if (!card || !card.isActive() || card.customer.id !== customerId)
      throw new NotFound(MessageKeyEnum.ENTITY_NOT_FOUND, { id });
    // A preferred card remains preferred until another card replaces it.
    const preferred = card.preferred || data.preferred;
    if (preferred) await this.clearPreferredCard(customerId);
    card.preferred = preferred;
    card.description = data.description;
    await this.cards.update(card);
    return this.cardMapper.toDto(card);
  }
  public async deleteCard(customerId: number, id: number): Promise<void> {
    await this.customer(customerId);
    const card = await this.cards.findById(id);
    if (!card || !card.isActive() || card.customer.id !== customerId)
      throw new NotFound(MessageKeyEnum.ENTITY_NOT_FOUND, { id });
    card.deactivate();
    await this.cards.update(card);
    if (card.preferred) {
      const replacement = (await this.cards.findByCustomerId(customerId))[0];
      if (replacement) {
        replacement.preferred = true;
        await this.cards.update(replacement);
      }
    }
  }
  private async customer(id: number) {
    const customer = await this.customers.findById(id);
    if (!customer || !customer.isActive() || !customer.user.isActive())
      throw new NotFound(MessageKeyEnum.ENTITY_NOT_FOUND, { id });
    return customer;
  }
  private async clearPreferredCard(customerId: number): Promise<void> {
    for (const card of await this.cards.findByCustomerId(customerId)) {
      if (card.preferred) {
        card.preferred = false;
        await this.cards.update(card);
      }
    }
  }
}
