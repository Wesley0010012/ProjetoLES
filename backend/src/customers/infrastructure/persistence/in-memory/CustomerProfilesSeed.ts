import { ResidenceTypeEnum } from 'src/customers/domain/enums/ResidenceTypeEnum';
import { StreetTypeEnum } from 'src/customers/domain/enums/StreetTypeEnum';
import { CustomerAddressTypeEnum } from 'src/customers/domain/enums/CustomerAddressTypeEnum';
import { Customer } from '../../../domain/entities/Customer';
import { CustomerAddress } from '../../../domain/entities/CustomerAddress';
import { CustomerCreditCard } from '../../../domain/entities/CustomerCreditCard';
import { CreditCardBrand } from '../../../domain/enums/CreditCardBrand';

const locations: Record<
  number,
  { city: string; state: string; zipCode: string }
> = {
  1: { city: 'São Paulo', state: 'SP', zipCode: '01001000' },
  2: { city: 'São Paulo', state: 'SP', zipCode: '01310100' },
  3: { city: 'Rio de Janeiro', state: 'RJ', zipCode: '22010000' },
  4: { city: 'Belo Horizonte', state: 'MG', zipCode: '30160010' },
  5: { city: 'Curitiba', state: 'PR', zipCode: '80010000' },
};

export function createAddressSeeds(customers: Customer[]): CustomerAddress[] {
  return customers.flatMap((customer) => {
    const location = locations[customer.id];
    if (!location)
      throw new Error(`Missing address seed for customer ${customer.id}`);
    const common = {
      customer,
      residenceType: ResidenceTypeEnum.HOUSE,
      streetType: StreetTypeEnum.STREET,
      district: 'Centro',
      country: 'Brasil',
      ...location,
    };
    const firstId = (customer.id - 1) * 3 + 1;
    return [
      new CustomerAddress(
        {
          ...common,
          name: 'Residencial principal',
          street: 'dos Compiladores',
          number: '302',
          type: CustomerAddressTypeEnum.Primary,
        },
        firstId,
      ),
      new CustomerAddress(
        {
          ...common,
          name: 'Cobrança',
          street: 'dos Algoritmos',
          number: '10',
          type: CustomerAddressTypeEnum.Billing,
        },
        firstId + 1,
      ),
      new CustomerAddress(
        {
          ...common,
          name: 'Entrega',
          street: 'da Arquitetura',
          number: '42',
          type: CustomerAddressTypeEnum.Delivery,
        },
        firstId + 2,
      ),
    ];
  });
}

export function createCardSeeds(customers: Customer[]): CustomerCreditCard[] {
  return customers.flatMap((customer) => {
    const firstId = (customer.id - 1) * 2 + 1;
    const common = { customer, printedName: customer.name.toUpperCase() };
    return [
      new CustomerCreditCard(
        {
          ...common,
          lastFourDigits: '4242',
          brand: CreditCardBrand.VISA,
          gatewayToken: `mock-card-seed-${customer.id}-visa`,
          preferred: true,
          description: 'Compras pessoais',
        },
        firstId,
      ),
      new CustomerCreditCard(
        {
          ...common,
          lastFourDigits: '8899',
          brand: CreditCardBrand.MASTERCARD,
          gatewayToken: `mock-card-seed-${customer.id}-mastercard`,
          preferred: false,
          description: 'Cartão adicional',
        },
        firstId + 1,
      ),
    ];
  });
}
